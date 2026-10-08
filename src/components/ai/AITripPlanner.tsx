"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Mic, X, Sparkles, Loader2, Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useMobile } from "@/hooks/useMediaQuery";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  isStreaming?: boolean;
  error?: boolean;
}

interface AIAction {
  type: string;
  label: string;
  payload: Record<string, unknown>;
}

const QUICK_PROMPTS = [
  "Plan a 5-day trip to Sikkim for 2 people under ₹50,000",
  "Find me a romantic getaway in Kerala for a weekend",
  "Best adventure trips in Ladakh for solo traveler",
  "Family-friendly beach vacation in Goa under ₹30,000",
  "Weekend trip from Kolkata to Darjeeling",
  "Custom itinerary for Rajasthan heritage tour",
];

const WELCOME_MESSAGES = [
  "👋 Hi! I'm your AI travel companion. Where would you like to go?",
  "✨ Ready for an adventure? Tell me your dream destination!",
  "🗺️ Let's plan something amazing. What's on your mind?",
  "🌄 From mountains to beaches, I've got you covered. What's your vibe?",
];

export function AITripPlanner() {
  const [open, setOpen] = useState(false);
  const isMobile = useMobile();

  return (
    <>
      {" "}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group fixed right-4 z-[80] touch-target rounded-full",
          "bottom-[calc(var(--nav-h-mobile)+env(safe-area-inset-bottom,0px)+16px)]",
          "md:bottom-6 md:right-6",
          "transition-all duration-300 hover:scale-105 active:scale-95",
          isMobile ? "p-1" : "p-0"
        )}
        aria-label="Open AI Trip Planner"
      >
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-saffron shadow-glow-saffron">
          <span className="absolute inset-0 animate-ping-soft rounded-full bg-gradient-saffron opacity-40" />
          <span className="absolute inset-0 rounded-full bg-gradient-saffron opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
          <Sparkles className="relative z-10 h-6 w-6 text-bg" />
        </span>
        {!isMobile && (
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-surface/90 px-4 py-2 text-sm font-medium text-text opacity-0 shadow-lg backdrop-blur-xl transition-opacity duration-300 group-hover:opacity-100">
            AI Trip Planner
          </span>
        )}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" size="full" className="p-0 max-w-[480px]">
          <AIPlannerSheetContent onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function AIPlannerSheetContent({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)],
        timestamp: new Date(),
      }]);
    }
  }, []);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const text = (overrideText ?? input).trim();
    if (!text || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowQuickPrompts(false);
    const userInput = text;
    setInput("");
    setIsStreaming(true);

    // Simulate AI response streaming (20s timeout, graceful errors)
    try {
      const response = await Promise.race([
        simulateAIResponse(userInput),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AI_TIMEOUT")), 20000)
        ),
      ]);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Stream the response
      for (let i = 0; i <= response.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 15));
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: response.slice(0, i) }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: response, isStreaming: false, actions: generateActions(userInput) }
            : msg
        )
      );
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content:
            "Sorry, I couldn't reach the travel assistant just now (it may be waking up). Please try again in a moment — or tap Retry below.",
          timestamp: new Date(),
          error: true,
          actions: [{ type: "retry", label: "Retry", payload: { text: userInput } }],
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    void handleSend(undefined, prompt);
  };

  const handleAction = (action: AIAction) => {
    if (action.type === "retry" && typeof action.payload.text === "string") {
      void handleSend(undefined, action.payload.text);
      return;
    }
    if (action.type === "search_flights") window.location.href = "/flights";
    else if (action.type === "search_hotels") window.location.href = "/hotels";
    else if (action.type === "search_cabs") window.location.href = "/cabs";
    else if (action.type === "search_activities") window.location.href = "/destinations";
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <motion.div
            className="p-2 rounded-xl bg-gradient-saffron"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Sparkles className="h-5 w-5 text-bg" />
          </motion.div>
          <div>
            <h2 className="font-display text-heading-md font-semibold text-text">AI Trip Planner</h2>
            <p className="text-caption text-text-muted">Plan your perfect journey with AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={copyMessage}
                onAction={handleAction}
              />
            ))}
            {isStreaming && (
              <motion.div
                key="streaming"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-violet flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Quick Prompts */}
      <AnimatePresence>
        {showQuickPrompts && messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 border-t border-border"
          >
            <p className="text-caption text-text-muted mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.slice(0, 4).map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="h-auto px-3 py-2 text-captain"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your trip..."
              className={cn(
                "field min-h-[52px] max-h-[150px] pr-14 resize-none",
                "bg-surface/80 backdrop-blur-xl border-border/50",
                "focus:border-cyan focus:ring-2 focus:ring-cyan/30",
                "text-body"
              )}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                aria-label="Clear message"
                className="absolute right-2 bottom-2 flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            variant="saffron"
            size="lg"
            className="min-h-[52px] glow"
            disabled={!input.trim() || isStreaming}
            whileTap={{ scale: 0.98 }}
            aria-label="Send message"
          >
            {isStreaming ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
        <p className="text-micro text-text-muted mt-2 text-center">
          AI responses are for planning assistance. Bookings require human confirmation.
        </p>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  onAction,
}: {
  message: Message;
  onCopy: (content: string) => void;
  onAction: (action: AIAction) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
        message.role === "user"
          ? "bg-gradient-saffron"
          : "bg-gradient-violet"
      )}>
        {message.role === "user" ? (
          <User className="h-4 w-4 text-bg" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      <div className={cn(
        "flex-1 max-w-[80%] glass rounded-2xl p-4",
        message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
      )}>
        <div className="prose prose-invert max-w-none text-body">
          {message.content.split("\n").map((line, i) => (
            <p key={i} className="whitespace-pre-wrap">{line}</p>
          ))}
        </div>

        {message.actions && message.actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.actions.map((action) => (
              <Button
                key={action.type}
                variant="outline"
                size="sm"
                onClick={() => onAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          <span className="text-micro text-text-muted">{message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {message.role === "assistant" && (
            <>
              <button
                onClick={() => onCopy(message.content)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-text transition-colors"
                aria-label="Copy message"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-cyan transition-colors" aria-label="Good response">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button className="flex min-h-[44px] min-w-[44px] items-center justify-center text-text-muted hover:text-error transition-colors" aria-label="Bad response">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Simulate AI response (replace with actual API call)
async function simulateAIResponse(input: string): Promise<string> {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes("sikkim")) {
    return `I'd love to help you plan a Sikkim trip! 🏔️

**Suggested 5-Day Itinerary:**
- **Day 1:** Arrive at Bagdogra/NJP → Transfer to Gangtok (4-5 hrs) → Evening at MG Marg
- **Day 2:** Gangtok local - Rumtek Monastery, Enchey Monastery, Cable car ride
- **Day 3:** Day trip to Tsomgo Lake & Nathula Pass (permits required)
- **Day 4:** Gangtok → Pelling (4 hrs) → Pelling Skywalk, Khecheopalri Lake
- **Day 5:** Pelling → Bagdogra/NJP for departure

**Estimated Budget for 2:** ₹35,000-₹45,000 (hotels, transport, permits, meals)
**Best Time:** March-June or Oct-Dec
**Note:** Nathula permits need 1-2 days advance booking through registered operator.

Would you like me to search for flights/trains to Bagdogra or hotels in Gangtok?`;
  }

  if (lowerInput.includes("kerala")) {
    return `Kerala is perfect for a romantic getaway! 💚

**5-Day Romantic Kerala Circuit:**
- **Day 1:** Kochi arrival → Fort Kochi sunset → Kathakali show
- **Day 2:** Kochi → Munnar (4 hrs) → Tea gardens, Top Station
- **Day 3:** Munnar → Alleppey (3 hrs) → Overnight houseboat
- **Day 4:** Alleppey → Kovalam (3 hrs) → Beach sunset
- **Day 5:** Kovalam → Trivandrum departure

**Estimated Budget for 2:** ₹40,000-₹55,000
**Best Time:** Sep-Mar (avoid monsoon Jun-Aug unless you want Ayurveda season)

Want me to search for houseboats in Alleppey or flights to Kochi?`;
  }

  if (lowerInput.includes("ladakh")) {
    return `Ladakh is the ultimate adventure destination! 🏔️

**6-Day Leh-Ladakh Adventure:**
- **Day 1:** Fly to Leh → Acclimatization (critical!)
- **Day 2:** Leh local - Shanti Stupa, Leh Palace, Hall of Fame
- **Day 3:** Leh → Nubra Valley via Khardung La → Hunder sand dunes
- **Day 4:** Nubra → Pangong Tso → Overnight at lake
- **Day 5:** Pangong → Leh via Chang La
- **Day 6:** Departure

**Estimated Budget for 1:** ₹45,000-₹60,000
**Critical:** Spend 2 days acclimatizing in Leh before high passes
**Best Time:** May-Sep (roads open)

Need help with flights to Leh or cab bookings for the circuit?`;
  }

  // Generic response
  return `I'd be happy to help you plan that trip! 🌟

To give you the best recommendations, could you tell me:
1. **Dates** - When are you thinking of traveling?
2. **Budget** - What's your per-person budget (excluding flights)?
3. **Travelers** - Solo, couple, family, or group?
4. **Vibe** - Mountains, beaches, heritage, adventure, wellness?

Once I know these, I can search for destinations, flights, hotels, and create a detailed itinerary with cost estimates!`;
}

function generateActions(input: string): AIAction[] {
  const lowerInput = input.toLowerCase();
  const actions: AIAction[] = [];

  if (lowerInput.includes("flight")) {
    actions.push({ type: "search_flights", label: "Search Flights", payload: {} });
  }
  if (lowerInput.includes("hotel") || lowerInput.includes("stay")) {
    actions.push({ type: "search_hotels", label: "Search Hotels", payload: {} });
  }
  if (lowerInput.includes("cab") || lowerInput.includes("transport")) {
    actions.push({ type: "search_cabs", label: "Search Cabs", payload: {} });
  }
  if (lowerInput.includes("activity") || lowerInput.includes("thing to do")) {
    actions.push({ type: "search_activities", label: "Find Activities", payload: {} });
  }

  return actions;
}