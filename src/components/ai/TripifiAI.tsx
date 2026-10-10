"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import JourneyLoader from "@/components/ui/JourneyLoader";
import { useApp } from "@/lib/store";
import { briefSummary, parseTripBrief, type TripBrief } from "@/lib/ai";
import { formatINR } from "@/lib/utils";
import { confirmAction, isAIBackendAvailable, streamMessage } from "@/lib/ai/client";
import { progressLabel } from "@/lib/ai/events";
import { executeAction } from "@/lib/ai/actions";
import type { ResponseCard, UIAction } from "@/lib/ai/types";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  brief?: TripBrief;
  cards?: ResponseCard[];
  actions?: UIAction[];
  pendingAction?: UIAction | null;
  demo?: boolean;
  /** True when the prose was narrated live by the connected backend. */
  live?: boolean;
}

const SUGGESTED_PROMPTS = [
  "I want to travel from Kolkata to Sikkim for 6 days with my partner, comfortable hotels, private cabs and a budget under ₹50,000",
  "5 days in Kashmir under ₹50,000",
  "Weekend trip from Mumbai to Goa",
  "Family trip to Rajasthan for 7 days",
  "Honeymoon in Kerala under ₹40,000",
];

export default function TripifiAI({
  onClose,
  isFullScreen = false,
}: {
  onClose?: () => void;
  isFullScreen?: boolean;
}) {
  const router = useRouter();
  const store = useApp();
  const { ensureDraftTrip, currentTrip } = store;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hi! I'm Tripifi AI, your personal travel concierge. Tell me where you'd like to go, your preferences, budget or dates - I'll help build your complete journey.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view (transform-safe: scroll only).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isThinking, progress]);

  const pushAssistant = (msg: Omit<Message, "id" | "type" | "timestamp">) =>
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: "assistant", timestamp: new Date() }]);

  /** Local deterministic fallback when the AI backend is unreachable. */
  const handleLocal = (messageText: string) => {
    const brief = parseTripBrief(messageText);
    const summary = briefSummary(brief);
    pushAssistant({
      content: summary
        ? `Here's a demo draft for ${summary}. Estimated ${formatINR(42000)}–${formatINR(52000)} for 2 travellers — sample pricing, not a booking. Add it to the Trip Builder to customize day by day.`
        : "I can help you build a complete itinerary with flights/trains, hotels, cabs, activities and a detailed budget. Tell me your origin, destination, days, travellers and budget — for example, 'Kolkata to Sikkim, 6 days, 2 people, under ₹50,000'.",
      brief: summary ? brief : undefined,
      demo: true,
    });
    setIsThinking(false);
    setProgress(null);
  };

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim() || isThinking) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, type: "user", content: messageText, timestamp: new Date() },
    ]);
    setInput("");
    setIsThinking(true);
    setProgress("Tripifi AI thinking…");

    if (!isAIBackendAvailable()) {
      setTimeout(() => handleLocal(messageText), 600);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await streamMessage(
        messageText,
        (ev) => {
          const label = progressLabel(ev.event);
          if (label) setProgress(label);
        },
        controller.signal
      );
      pushAssistant({
        content: result.message,
        cards: result.cards,
        actions: result.actions,
        pendingAction: result.pending_action,
        demo: result.is_demo,
        live: result.narrated_live ?? false,
      });
    } catch {
      // Graceful unavailable mode: local planning still works.
      handleLocal(messageText);
      return;
    } finally {
      setIsThinking(false);
      setProgress(null);
      abortRef.current = null;
    }
  };

  const runAction = async (msgId: string, action: UIAction) => {
    if (action.requires_confirmation) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, pendingAction: action } : m))
      );
      return;
    }
    const outcome = executeAction(action, store as never, (currentTrip?.items as never[]) ?? []);
    if (outcome.href) {
      pushAssistant({ content: outcome.message });
      router.push(outcome.href);
      return;
    }
    pushAssistant({ content: outcome.message });
    if (!outcome.ok) store.toast(outcome.message, "error");
  };

  const confirmPending = async (msgId: string, action: UIAction, confirmed: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, pendingAction: null } : m)));
    if (!confirmed) {
      await import("@/lib/ai/client").then((m) => m.rejectAction(action).catch(() => ({ ok: true })));
      pushAssistant({ content: "Understood — nothing was changed." });
      return;
    }
    try {
      await confirmAction(action);
    } catch {
      // Confirmation is best-effort; local execution is authoritative.
    }
    if (action.type === "REMOVE_ITEM") {
      const id = String(action.payload.id ?? action.payload.item_id ?? "");
      const trip = currentTrip;
      const target = trip?.items.find((i) => i.id === id);
      if (trip && target) {
        store.removeItemFromTrip(trip.id, id);
        pushAssistant({ content: `Removed ${target.title}.`, });
        return;
      }
      pushAssistant({ content: "I couldn't find that item in your trip. Nothing was changed." });
      return;
    }
    const outcome = executeAction(action, store as never, (currentTrip?.items as never[]) ?? []);
    pushAssistant({ content: outcome.message });
    if (outcome.href) router.push(outcome.href);
  };

  const addBriefToTrip = (brief: TripBrief) => {
    ensureDraftTrip({
      name: brief.destination ? `${brief.destination} Escape` : "My Journey",
      origin: brief.origin,
      destination: brief.destination,
      travellers: brief.travellers ?? 2,
      ...(brief.budget ? { budget: brief.budget } : {}),
    });
    store.toast("Draft added to the Trip Builder", "success");
  };

  return (
    <div
      className={`flex min-h-0 flex-col bg-surface ${
        isFullScreen ? "h-[100dvh]" : "h-full max-h-[86dvh] min-h-[480px]"
      }`}
    >
      <div className="border-b border-ink-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-navy-900 text-white flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink-900">Tripifi AI</h3>
            <p className="text-xs text-ink-500">Your travel concierge</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isThinking && (
            <button
              onClick={() => abortRef.current?.abort()}
              className="inline-flex min-h-[44px] items-center rounded-xl px-3 text-xs font-medium text-ink-500 hover:bg-ink-50"
            >
              Stop
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close assistant"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-ink-500 hover:bg-ink-50 hover:text-ink-900 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 thin-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex journey-msg-in ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.type === "user"
                  ? "bg-navy-900 text-white"
                  : "bg-ink-50 text-ink-900"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
              {msg.demo && (
                <p className="mt-1 text-[10px] text-ink-400">
                  {msg.live
                    ? "Live narration · sample pricing data, not a booking."
                    : "Demo planning — connect the AI backend for live intelligence."}
                </p>
              )}
              {msg.type === "assistant" && msg.brief && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => addBriefToTrip(msg.brief as TripBrief)}
                    className="btn-primary-sm min-h-[44px]"
                  >
                    Add to Trip Builder
                  </button>
                </div>
              )}
              {msg.type === "assistant" && msg.cards && msg.cards.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.cards.map((card, i) => (
                    <ResponseCardView key={i} card={card} onAction={(a) => runAction(msg.id, a)} />
                  ))}
                </div>
              )}
              {msg.type === "assistant" && msg.actions && msg.actions.length > 0 && !msg.cards?.length && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.actions.map((a, i) => (
                    <button
                      key={i}
                      onClick={() => runAction(msg.id, a)}
                      className="btn-ghost-sm min-h-[44px] text-xs"
                    >
                      {actionLabel(a.type)}
                    </button>
                  ))}
                </div>
              )}
              {msg.type === "assistant" && msg.pendingAction && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3" role="dialog" aria-label="Confirm action">
                  <p className="text-xs font-medium text-amber-900">
                    {actionLabel(msg.pendingAction.type)} — are you sure? This will change your trip.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => confirmPending(msg.id, msg.pendingAction as UIAction, true)} className="btn-primary-sm min-h-[44px] text-xs">
                      Yes, apply
                    </button>
                    <button onClick={() => confirmPending(msg.id, msg.pendingAction as UIAction, false)} className="btn-ghost-sm min-h-[44px] text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start journey-msg-in">
            <div className="bg-ink-50 rounded-2xl px-4 py-3 max-w-[85%]" role="status">
              <JourneyLoader label={progress ?? "Tripifi AI thinking…"} />
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="space-y-2 pt-4">
            <p className="text-xs text-ink-500 mb-2">Suggested prompts</p>
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="w-full min-h-[44px] text-left rounded-lg border border-ink-100 p-2.5 hover:bg-ink-50 transition-colors"
              >
                <p className="text-xs text-ink-700 leading-relaxed line-clamp-2">
                  {prompt}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-ink-100 p-3 safe-bottom">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Tripifi AI anything about your trip..."
            aria-label="Ask Tripifi AI"
            className="field resize-none min-h-[52px] max-h-32 py-3 text-[16px] md:text-sm"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isThinking}
            size="sm"
          >
            Send
          </Button>
        </div>
        <p className="text-[10px] text-ink-500 mt-2 text-center">
          Tripifi AI can suggest destinations, build itineraries & estimate budgets
        </p>
      </div>
      </div>
    </div>
  );
}

function actionLabel(type: string): string {
  return type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function ResponseCardView({ card, onAction }: { card: ResponseCard; onAction: (a: UIAction) => void }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-surface p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-700">{card.kind}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-900">{card.title}</p>
      {card.subtitle && <p className="text-xs text-ink-600">{card.subtitle}</p>}
      {Object.keys(card.details ?? {}).length > 0 && (
        <dl className="mt-2 space-y-0.5 text-xs">
          {Object.entries(card.details).slice(0, 5).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-ink-500">{k.replace(/_/g, " ")}</dt>
              <dd className="text-right font-medium text-ink-800">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      {card.actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {card.actions.map((a, i) => (
            <button key={i} onClick={() => onAction(a)} className="btn-ghost-sm min-h-[44px] text-xs">
              {actionLabel(a.type)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
