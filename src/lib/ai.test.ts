import { describe, expect, it } from "vitest";
import { briefSummary, parseTripBrief } from "./ai";

describe("AI demo trip parsing", () => {
  it("extracts the full scenario", () => {
    const brief = parseTripBrief("I want to travel from Kolkata to Sikkim for 6 days with my partner, budget under ₹50,000");
    expect(brief.origin).toBe("Kolkata");
    expect(brief.destination).toBe("Sikkim");
    expect(brief.destinationSlug).toBe("sikkim");
    expect(brief.days).toBe(6);
    expect(brief.travellers).toBe(2);
    expect(brief.budget).toBe(50000);
    expect(briefSummary(brief)).toContain("Sikkim");
  });

  it("handles weekends and honeymoons", () => {
    const brief = parseTripBrief("Honeymoon in Kerala");
    expect(brief.destination).toBe("Kerala");
    expect(brief.travellers).toBe(2);
  });

  it("returns empty brief for vague input", () => {
    expect(parseTripBrief("hello there")).toEqual({});
  });
});
