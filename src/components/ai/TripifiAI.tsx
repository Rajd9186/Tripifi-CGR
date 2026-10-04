"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { briefSummary, parseTripBrief, type TripBrief } from "@/lib/ai";
import { formatINR } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  brief?: TripBrief;
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
  const { ensureDraftTrip } = useApp();

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const brief = parseTripBrief(messageText);
      const summary = briefSummary(brief);
      const content = summary
        ? `Here's a demo draft for ${summary}. Estimated ${formatINR(42000)}–${formatINR(52000)} for 2 travellers — sample pricing, not a booking. Add it to the Trip Builder to customize day by day.`
        : "I can help you build a complete itinerary with flights/trains, hotels, cabs, activities and a detailed budget. Tell me your origin, destination, days, travellers and budget — for example, 'Kolkata to Sikkim, 6 days, 2 people, under ₹50,000'.";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content,
        timestamp: new Date(),
        brief: summary ? brief : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 1500);
  };

  const addBriefToTrip = (brief: TripBrief) => {
    ensureDraftTrip({
      name: brief.destination ? `${brief.destination} Escape` : "My Journey",
      origin: brief.origin,
      destination: brief.destination,
      travellers: brief.travellers ?? 2,
      ...(brief.budget ? { budget: brief.budget } : {}),
    });
  };

  return (
    <div
      className={`flex min-h-0 flex-col bg-white ${
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 thin-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
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
              {msg.type === "assistant" && msg.brief && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => addBriefToTrip(msg.brief as TripBrief)}
                    className="btn-primary-sm min-h-[44px]"
                  >
                    Add to Trip Builder
                  </button>
                  <Link href="/plan" className="btn-ghost-sm min-h-[44px]">
                    Open Builder
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-ink-50 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-ink-400 animate-pulse"></span>
                <span className="h-2 w-2 rounded-full bg-ink-400 animate-pulse delay-75"></span>
                <span className="h-2 w-2 rounded-full bg-ink-400 animate-pulse delay-150"></span>
              </div>
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
                className="w-full text-left rounded-lg border border-ink-100 p-2.5 hover:bg-ink-50 transition-colors"
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
