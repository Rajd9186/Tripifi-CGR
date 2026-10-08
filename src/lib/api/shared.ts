/** Shared envelope handling. Backend returns {success, data, error, requestId}. */

import { apiRequest, isBackendConfigured } from "./client";
import type { SearchMode } from "./types";

export interface SearchMeta {
  mode: SearchMode;
  source: string;
  fetched_at?: string;
  provider: { name: string; status: string };
  requestId: string;
}

export interface SearchResponse<T> {
  results: T[];
  meta: SearchMeta;
}

export interface Envelope<T> {
  results: T[];
  provider: { name: string; status: string };
  requestId: string;
  meta: SearchMeta;
}

function toMeta(
  provider: { name: string; status: string },
  requestId: string,
  data?: { mode?: SearchMode; source?: string; fetched_at?: string } | null
): SearchMeta {
  const mode: SearchMode =
    data?.mode ?? (provider.status === "LIVE" ? "LIVE" : provider.status === "DEMO" ? "ASSISTED" : "ASSISTED");
  return {
    mode,
    source: data?.source ?? provider.name,
    fetched_at: data?.fetched_at,
    provider,
    requestId,
  };
}

export async function postSearch<T>(path: string, body: Record<string, unknown>): Promise<Envelope<T>> {
  const res = await apiRequest<{
    success: boolean;
    data: {
      results: T[];
      provider: { name: string; status: string };
      mode?: SearchMode;
      source?: string;
      fetched_at?: string;
    } | null;
    error: { code: string; message: string } | null;
    requestId: string;
  }>(path, { method: "POST", body: JSON.stringify(body), auth: false });
  if (!res.success || !res.data) {
    const code = res.error?.code ?? "SEARCH_FAILED";
    const err = new Error(res.error?.message ?? "We couldn't retrieve availability right now.") as Error & { code: string };
    err.code = code;
    throw err;
  }
  return {
    results: res.data.results,
    provider: res.data.provider,
    requestId: res.requestId,
    meta: toMeta(res.data.provider, res.requestId, res.data),
  };
}

export function backendReady(): boolean {
  return isBackendConfigured();
}
