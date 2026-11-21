import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { KitChecklist } from "@/components/guides/KitChecklist";
import { PreferencesProvider } from "@/context/PreferencesContext";

describe("KitChecklist Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <PreferencesProvider>
        <KitChecklist locale="en" />
      </PreferencesProvider>
    );
  };

  it("renders all 12 kit checklist items", () => {
    renderComponent();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(12);
  });

  it("calculates and displays progress correctly at start (0%)", () => {
    renderComponent();
    expect(screen.getByText(/0 of 12 items packed/i)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("toggles an item and updates progress", () => {
    renderComponent();
    const firstCheckbox = screen.getAllByRole("checkbox")[0]!;
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    expect(screen.getByText(/1 of 12 items packed/i)).toBeInTheDocument();
    expect(screen.getByText("8%")).toBeInTheDocument();
  });

  it("opens confirmation dialog when Reset button is clicked", () => {
    renderComponent();
    const firstCheckbox = screen.getAllByRole("checkbox")[0]!;
    fireEvent.click(firstCheckbox);

    const resetBtn = screen.getByRole("button", { name: /Reset Checklist/i });
    expect(resetBtn).not.toBeDisabled();

    fireEvent.click(resetBtn);

    // Confirmation dialog appears
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Reset kit checklist\?/i)).toBeInTheDocument();
  });

  it("clears all ticked items when reset is confirmed", () => {
    renderComponent();
    const firstCheckbox = screen.getAllByRole("checkbox")[0]!;
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();

    const resetBtn = screen.getByRole("button", { name: /Reset Checklist/i });
    fireEvent.click(resetBtn);

    const confirmBtn = screen.getByRole("button", { name: /Reset All/i });
    fireEvent.click(confirmBtn);

    expect(firstCheckbox).not.toBeChecked();
    expect(screen.getByText(/0 of 12 items packed/i)).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("triggers window.print when print button is clicked", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderComponent();

    const printBtn = screen.getByRole("button", { name: /Print Checklist/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});
