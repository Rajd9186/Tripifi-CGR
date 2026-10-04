const UTM = "utm_source=tripifi_cgr&utm_medium=referral";

export function withUtm(url: string): string {
  if (!url) return url;
  return url.includes("?") ? `${url}&${UTM}` : `${url}?${UTM}`;
}

/** Size an Unsplash photo URL (photo.urls.*) without rehosting. */
export function sizeUnsplash(url: string, width: number, quality = 80): string {
  if (!url || !url.includes("images.unsplash.com")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=${width}&q=${quality}&auto=format&fit=crop`;
}

export function heroSrcSet(url: string): string {
  if (!url.includes("images.unsplash.com")) return url;
  return [768, 1280, 1920].map((w) => `${sizeUnsplash(url, w)} ${w}w`).join(", ");
}

export function tokensOf(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

/** Query aliases that resolve to grouped destination records. */
export const DESTINATION_ALIASES: Record<string, string> = {
  meghalaya: "northeast-india",
  darjeeling: "west-bengal",
};

export function resolveDestinationSlug(slug: string): string {
  const s = slug.toLowerCase();
  return DESTINATION_ALIASES[s] ?? s;
}

export function relevanceScore(haystack: string, tokens: string[]): number {
  const h = haystack.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (h.includes(t)) score += t.length >= 6 ? 3 : 1;
  }
  return score;
}
