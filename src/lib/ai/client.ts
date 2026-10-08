"use client";

import { apiRequest, isBackendConfigured } from "@/lib/api/client";
import type { AIEvent, AIResult } from "./types";

function conversationId(): string {
  if (typeof window === "undefined") return "default";
  let id = window.sessionStorage.getItem("tripifi_conversation_id");
  if (!id) {
    id = `conv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    window.sessionStorage.setItem("tripifi_conversation_id", id);
  }
  return id;
}

export function getConversationId(): string {
  return conversationId();
}

function tripSnapshot(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("tripifi_state_v1");
    if (!raw) return null;
    const state = JSON.parse(raw) as { trips?: Array<Record<string, unknown>> };
    const draft = (state.trips ?? []).find((t) => t.status === "draft") ?? (state.trips ?? [])[0];
    return draft ?? null;
  } catch {
    return null;
  }
}

export async function sendMessage(message: string): Promise<AIResult> {
  return apiRequest<AIResult>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId(),
      trip_context: tripSnapshot(),
    }),
  });
}

export function isAIBackendAvailable(): boolean {
  return isBackendConfigured();
}

/** SSE stream. Calls onEvent for progress, resolves with AI_RESULT. */
export async function streamMessage(
  message: string,
  onEvent: (event: AIEvent) => void,
  signal?: AbortSignal
): Promise<AIResult> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
  let res: Response;
  try {
    res = await fetch(`${base}/ai/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        conversation_id: conversationId(),
        trip_context: tripSnapshot(),
      }),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new Error("Tripifi AI is temporarily unavailable.");
  }
  if (!res.ok || !res.body) throw new Error(`AI stream failed (${res.status})`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: AIResult | null = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // SSE frames end with a blank line: \n\n or \r\n\r\n (sse-starlette uses \r\n).
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const eventMatch = /^event:\s*(.+)$/m.exec(part);
      const dataMatch = /^data:\s*([\s\S]+)$/m.exec(part);
      if (!eventMatch || !dataMatch) continue;
      const event = eventMatch[1].trim() as AIEvent["event"];
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(dataMatch[1].trim()) as Record<string, unknown>;
      } catch {
        continue;
      }
      onEvent({ event, data });
      if (event === "AI_RESULT") result = data as unknown as AIResult;
      if (event === "AI_ERROR") {
        throw new Error((data.message as string) || "Tripifi AI is temporarily unavailable.");
      }
    }
  }
  if (result) return result;
  throw new Error("Tripifi AI returned no result.");
}

export async function confirmAction(action: { type: string; payload?: Record<string, unknown> }): Promise<{ ok: boolean }> {
  return apiRequest("/ai/action/confirm", {
    method: "POST",
    body: JSON.stringify({ type: action.type, payload: action.payload ?? {} }),
  });
}

export async function rejectAction(action: { type: string }): Promise<{ ok: boolean }> {
  return apiRequest("/ai/action/reject", {
    method: "POST",
    body: JSON.stringify({ type: action.type }),
  });
}
