/** Product analytics hooks. Buffers events locally; backend endpoint optional.
 * Used to learn which services need paid API investment (e.g. hotels vs cabs).
 */

const KEY = "tripifi_analytics";
const EVENTS = [
  "enquiry_created",
  "enquiry_submitted",
  "enquiry_duplicate_blocked",
  "provider_failed",
  "fallback_shown",
  "fallback_started",
  "fallback_completed",
  "admin_contacted",
  "quote_created",
  "enquiry_confirmed",
] as const;

export type AnalyticsEvent = (typeof EVENTS)[number];

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const buf: Array<Record<string, unknown>> = raw ? JSON.parse(raw) : [];
    buf.push({ event, ...props, at: new Date().toISOString() });
    window.localStorage.setItem(KEY, JSON.stringify(buf.slice(-200)));
  } catch {
    // analytics must never break the product
  }
}
