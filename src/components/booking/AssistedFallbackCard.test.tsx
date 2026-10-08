import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AssistedFallbackCard from "@/components/booking/AssistedFallbackCard";

afterEach(() => cleanup());

// next/navigation is app-router only — stub the bits the form uses.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Analytics must never break tests.
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

const fill = (label: RegExp | string, value: string) => {
  const input = screen.getByLabelText(label) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
};

describe("AssistedFallbackCard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the prefilled selected details", () => {
    render(
      <AssistedFallbackCard
        type="FLIGHT"
        prefill={{ origin: "Kolkata", destination: "Gangtok", traveller_count: 2 }}
        summary={[
          { label: "Service", value: "Flight" },
          { label: "From", value: "Kolkata" },
          { label: "To", value: "Gangtok" },
        ]}
      />
    );
    expect(screen.getByText("Your selected details")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Kolkata")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Gangtok")).toBeInTheDocument();
  });

  it("requires only name + phone + consent; email stays optional", async () => {
    render(<AssistedFallbackCard type="CAB" />);
    fireEvent.click(screen.getByRole("button", { name: /request booking assistance/i }));
    expect(await screen.findByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid 10-digit Indian mobile number.")).toBeInTheDocument();
    expect(screen.getByText("Please agree to be contacted about this enquiry.")).toBeInTheDocument();
    // Email optional: no email error even though the field is empty.
    expect(screen.queryByText(/email address/i)).not.toBeInTheDocument();
  });

  it("shows the representative success message with reference and track link", async () => {
    render(<AssistedFallbackCard type="HOTEL" />);
    fill(/full name/i, "Aarav Sharma");
    fill(/mobile number/i, "9876543210");
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /request booking assistance/i }));

    const heading = await screen.findByRole("heading", { name: /customer representative will contact you shortly/i });
    expect(heading).toHaveTextContent("Thanks Aarav Sharma!");
    expect(screen.getByText(/TFC-/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /track my enquiry/i })).toHaveAttribute(
      "href",
      expect.stringContaining("/assistance/track?ref=")
    );
  });

  it("keeps form data and offers retry on failure", async () => {
    const { enquiriesApi } = await import("@/lib/api/enquiries");
    const spy = vi.spyOn(enquiriesApi, "create").mockRejectedValueOnce(new Error("boom"));
    try {
      render(<AssistedFallbackCard type="TRAIN" />);
      fill(/full name/i, "Aarav Sharma");
      fill(/mobile number/i, "9876543210");
      fireEvent.click(screen.getByRole("checkbox"));
      fireEvent.click(screen.getByRole("button", { name: /request booking assistance/i }));

      await screen.findByText(/details are preserved/i);
      // Data preserved for retry.
      expect(screen.getByDisplayValue("Aarav Sharma")).toBeInTheDocument();
      expect(screen.getByDisplayValue("9876543210")).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("is duplicate-click safe", async () => {
    const { enquiriesApi } = await import("@/lib/api/enquiries");
    let calls = 0;
    const spy = vi.spyOn(enquiriesApi, "create").mockImplementation(async (...args: unknown[]) => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 50));
      return {
        id: "1",
        reference_number: "TFC-2026-000001",
        type: "FLIGHT",
        status: "NEW",
        customer_name: "Aarav Sharma",
        traveller_count: 2,
        created_at: new Date().toISOString(),
      };
    });
    try {
      render(<AssistedFallbackCard type="FLIGHT" />);
      fill(/full name/i, "Aarav Sharma");
      fill(/mobile number/i, "9876543210");
      fireEvent.click(screen.getByRole("checkbox"));
      const btn = screen.getByRole("button", { name: /request booking assistance/i });
      fireEvent.click(btn);
      fireEvent.click(btn);
      await waitFor(() => expect(screen.queryByText(/representative will contact you/i)).toBeInTheDocument());
      expect(calls).toBe(1);
    } finally {
      spy.mockRestore();
    }
  });
});
