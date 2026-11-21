import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DistrictSelect } from "@/components/alerts/DistrictSelect";
import { PreferencesProvider } from "@/context/PreferencesContext";

function renderWithPreferences(ui: React.ReactElement) {
  return render(<PreferencesProvider initialLocale="en">{ui}</PreferencesProvider>);
}

describe("DistrictSelect Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders accessible combobox with required ARIA attributes", () => {
    renderWithPreferences(<DistrictSelect locale="en" />);

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(combobox).toHaveAttribute("aria-autocomplete", "list");
    expect(combobox).toHaveAttribute("aria-controls", "district-listbox");
  });

  it("opens listbox on focus and renders options with role='option'", () => {
    renderWithPreferences(<DistrictSelect locale="en" />);

    const combobox = screen.getByRole("combobox");
    fireEvent.focus(combobox);

    expect(combobox).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    expect(screen.getByText(/Dhemaji/i)).toBeInTheDocument();
  });

  it("filters districts with debounced search query across languages", async () => {
    renderWithPreferences(<DistrictSelect locale="en" />);

    const combobox = screen.getByRole("combobox");
    fireEvent.focus(combobox);
    fireEvent.change(combobox, { target: { value: "Majuli" } });

    // Advance fake timers by debounce duration
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const options = screen.getAllByRole("option");
    expect(options.length).toBe(1);
    expect(screen.getByText(/Majuli/i)).toBeInTheDocument();
  });

  it("supports keyboard navigation: ArrowDown, ArrowUp, and Enter to select", async () => {
    const onSelect = vi.fn();
    renderWithPreferences(<DistrictSelect locale="en" onSelect={onSelect} />);

    const combobox = screen.getByRole("combobox");

    // Open via ArrowDown
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(combobox).toHaveAttribute("aria-expanded", "true");

    // Move to first item
    fireEvent.keyDown(combobox, { key: "ArrowDown" });
    expect(combobox).toHaveAttribute("aria-activedescendant");

    // Press Enter to select
    fireEvent.keyDown(combobox, { key: "Enter" });

    expect(onSelect).toHaveBeenCalled();
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  it("closes listbox on Escape key", () => {
    renderWithPreferences(<DistrictSelect locale="en" />);

    const combobox = screen.getByRole("combobox");
    fireEvent.focus(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(combobox, { key: "Escape" });
    expect(combobox).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("allows clearing selected district with clear button", () => {
    renderWithPreferences(<DistrictSelect locale="en" />);

    const combobox = screen.getByRole("combobox");
    fireEvent.focus(combobox);

    const dhemajiOption = screen.getByText(/Dhemaji/i);
    fireEvent.click(dhemajiOption);

    // Clear button should be visible
    const clearBtn = screen.getByRole("button", { name: /Clear district/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(screen.getByRole("combobox")).toHaveValue("");
  });
});
