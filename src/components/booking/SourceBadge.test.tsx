import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SourceBadge } from "@/components/booking/ProviderStatusBadge";

afterEach(() => cleanup());

describe("SourceBadge", () => {
  it("labels each mode honestly", () => {
    const { rerender } = render(<SourceBadge mode="LIVE" source="open_meteo" />);
    expect(screen.getByRole("status")).toHaveTextContent("Live · open_meteo");

    rerender(<SourceBadge mode="ESTIMATE" />);
    expect(screen.getByRole("status")).toHaveTextContent("Estimate");

    rerender(<SourceBadge mode="SCHEDULE_ONLY" />);
    expect(screen.getByRole("status")).toHaveTextContent("Scheduled timetable");

    rerender(<SourceBadge mode="DISCOVERY" />);
    expect(screen.getByRole("status")).toHaveTextContent("Discovery");

    rerender(<SourceBadge mode="ASSISTED" />);
    expect(screen.getByRole("status")).toHaveTextContent("Needs confirmation");

    rerender(<SourceBadge mode="DEMO" />);
    expect(screen.getByRole("status")).toHaveTextContent("Demo");

    rerender(<SourceBadge mode="UNAVAILABLE" />);
    expect(screen.getByRole("status")).toHaveTextContent("Unavailable");
  });

  it("shows relative update age", () => {
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    render(<SourceBadge mode="LIVE" source="osrm" fetchedAt={twoMinAgo} />);
    expect(screen.getByRole("status")).toHaveTextContent("updated 2 min ago");
  });

  it("hides the age when fetchedAt is missing", () => {
    render(<SourceBadge mode="LIVE" source="osrm" />);
    expect(screen.getByRole("status")).not.toHaveTextContent("updated");
  });

  it("offers a labelled refresh button", () => {
    const onRefresh = vi.fn();
    render(<SourceBadge mode="LIVE" source="osrm" onRefresh={onRefresh} />);
    const btn = screen.getByRole("button", { name: "Refresh results" });
    fireEvent.click(btn);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
