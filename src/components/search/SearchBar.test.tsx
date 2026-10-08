import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "@/components/search/SearchBar";

afterEach(() => cleanup());

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/hooks/useScrollPosition", () => ({
  useScrollPosition: () => ({ y: 0, isScrolled: false }),
}));

describe("SearchBar submit", () => {
  it("navigates to flight results with the selected values", () => {
    push.mockClear();
    render(<SearchBar variant="page" />);
    fireEvent.click(screen.getByRole("button", { name: /flights/i }));
    const from = screen.getByPlaceholderText("Delhi (DEL)") as HTMLInputElement;
    fireEvent.change(from, { target: { value: "Kolkata" } });
    const to = screen.getByPlaceholderText("Mumbai (BOM)") as HTMLInputElement;
    fireEvent.change(to, { target: { value: "Delhi" } });
    fireEvent.click(screen.getByRole("button", { name: /search flights/i }));
    expect(push).toHaveBeenCalledTimes(1);
    const url = push.mock.calls[0][0] as string;
    expect(url.startsWith("/flights/results?")).toBe(true);
    expect(url).toContain(`from=${encodeURIComponent("Kolkata")}`);
    expect(url).toContain(`to=${encodeURIComponent("Delhi")}`);
  });

  it("navigates to destinations with the query", () => {
    push.mockClear();
    render(<SearchBar variant="page" />);
    const input = screen.getByPlaceholderText(/spiti valley/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Goa" } });
    fireEvent.click(screen.getByRole("button", { name: /explore destinations/i }));
    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toBe(`/destinations?q=${encodeURIComponent("Goa")}`);
  });

  it("calls onSearch when provided instead of navigating", () => {
    push.mockClear();
    const onSearch = vi.fn();
    render(<SearchBar variant="page" onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button", { name: /explore destinations/i }));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });
});
