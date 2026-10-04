/** Shared envelope handling. Backend returns {success, data, error, requestId}. */

import { apiRequest, isBackendConfigured } from "./client";

export interface Envelope<T> {
  results: T[];
  provider: { name: string; status: string };
  requestId: string;
}

export async function postSearch<T>(path: string, body: Record<string, unknown>): Promise<Envelope<T>> {
  const res = await apiRequest<{
    success: boolean;
    data: { results: T[]; provider: { name: string; status: string } } | null;
    error: { code: string; message: string } | null;
    requestId: string;
  }>(path, { method: "POST", body: JSON.stringify(body), auth: false });
  if (!res.success || !res.data) {
    const code = res.error?.code ?? "SEARCH_FAILED";
    const err = new Error(res.error?.message ?? "We couldn't retrieve availability right now.") as Error & { code: string };
    err.code = code;
    throw err;
  }
  return { results: res.data.results, provider: res.data.provider, requestId: res.requestId };
}

export function backendReady(): boolean {
  return isBackendConfigured();
}
