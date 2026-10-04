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

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
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
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
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

  const res = await fetch(`${baseUrl()}${path}`, { ...init, headers });
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
