import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AutocompleteInput } from "@/components/ui/AutocompleteInput";

afterEach(() => cleanup());

const OPTIONS = [
  { id: "goa", label: "Goa", sublabel: "Beaches", code: "GOI", category: "Destination" },
  { id: "kashmir", label: "Kashmir", sublabel: "Mountains", code: "KSH", category: "Destination" },
];

describe("AutocompleteInput selection", () => {
  it("keeps the selected option visible in the field", () => {
    const onSelect = vi.fn();
    render(
      <AutocompleteInput
        label="Search destinations"
        placeholder="Try: Goa..."
        options={OPTIONS}
        onSelect={onSelect}
      />
    );
    const input = screen.getByPlaceholderText("Try: Goa...") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "goa" } });
    const option = screen.getByRole("option", { name: /Goa/ });
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "goa" }));
    // The selection must actually show up on screen (not clear the field).
    expect(input.value).toBe("Goa");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clears the field when the clear button is used", () => {
    const onSelect = vi.fn();
    render(
      <AutocompleteInput
        label="Search"
        placeholder="Search..."
        options={OPTIONS}
        onSelect={onSelect}
      />
    );
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "goa" } });
    fireEvent.click(screen.getByRole("option", { name: /Goa/ }));
    expect(input.value).toBe("Goa");
    fireEvent.click(screen.getByLabelText("Clear search"));
    expect(input.value).toBe("");
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "" }));
  });
});
