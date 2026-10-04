"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
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
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "I can help you build a complete itinerary with flights/trains, hotels, cabs, activities and a detailed budget. This is ready to connect to our AI engine when integrated. Would you like me to create an itinerary based on this?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div
      className={`flex flex-col ${
        isFullScreen ? "h-[100vh]" : "h-[600px]"
      } bg-white`}
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
            className="h-8 w-8 rounded-lg hover:bg-ink-50 flex items-center justify-center"
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

      <div className="flex-1 overflow-auto p-4 space-y-4 thin-scrollbar">
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

      <div className="border-t border-ink-100 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Tripifi AI anything about your trip..."
            className="field resize-none min-h-[44px] max-h-32 py-2 text-sm"
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
  );
}
