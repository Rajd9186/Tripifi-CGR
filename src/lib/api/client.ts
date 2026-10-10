/** Centralized API client. All backend calls go through here — no scattered fetch(). */

import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  code: string;
  requestId: string;
  status: number;

  constructor(message: string, opts: { code: string; requestId: string; status: number }) {
    super(message);
    this.code = opts.code;
    this.requestId = opts.requestId;
    this.status = opts.status;
  }
}

const RENDER_FALLBACK = "https://tripifi-cgr-1.onrender.com/api/v1";

/** Backend base URL. Explicit env wins; on the deployed site fall back to the
 *  live Render backend so a missing dashboard var degrades to working AI
 *  instead of a dead end. Local dev falls back to localhost. */
export function resolveApiBase(): string {
  const env = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined" && /\.onrender\.com$/.test(window.location.hostname)) {
    return RENDER_FALLBACK;
  }
  return "http://localhost:8000/api/v1";
}

function baseUrl(): string {
  return resolveApiBase();
}

function requestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("tripifi_access_token");
}

export function isBackendConfigured(): boolean {
  // Explicit env always counts. On the deployed site the Render fallback
  // backend exists even when the dashboard var is missing. Plain localhost
  // without env keeps local mock data (backend optional in dev).
  if ((process.env.NEXT_PUBLIC_API_URL ?? "").trim()) return true;
  if (typeof window !== "undefined" && /\.onrender\.com$/.test(window.location.hostname)) return true;
  return false;
}

interface RequestOpts extends RequestInit {
  auth?: boolean;
  idempotencyKey?: string;
}

export async function apiRequest<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { auth = true, idempotencyKey, ...init } = opts;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": requestId(),
    ...((init.headers as Record<string, string> | undefined) ?? {}),
  };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, { ...init, headers, signal: init.signal ?? controller.signal });
  } catch (e) {
    const aborted = (e as Error)?.name === "AbortError";
    throw new ApiError(
      aborted
        ? "The server is waking up. Please try again in a few seconds."
        : "Can't reach the server. Check your connection and try again.",
      { code: aborted ? "SERVER_WAKING" : "NETWORK", requestId: "req-client", status: 0 }
    );
  } finally {
    clearTimeout(timer);
  }
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => ({}))) as T & { error?: ApiErrorBody };
  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(err?.message ?? `Request failed (${res.status})`, {
      code: err?.code ?? "REQUEST_FAILED",
      requestId: err?.request_id ?? "req-unknown",
      status: res.status,
    });
  }
  return body as T;
}
