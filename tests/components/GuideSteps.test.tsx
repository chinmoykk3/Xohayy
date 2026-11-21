import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GuideSteps } from "@/components/guides/GuideSteps";
import { PreferencesProvider } from "@/context/PreferencesContext";
import type { LocaleGuide } from "@/lib/data";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/guides/flood",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockGuide: LocaleGuide = {
  hazard: "flood",
  title: "Flood Preparedness Guide",
  steps: [
    { id: "step-1", phase: "before", icon: "shield", text: "Move valuables to upper floors" },
    {
      id: "step-2",
      phase: "before",
      icon: "phone",
      text: "Keep phone charged and emergency kit ready",
    },
    {
      id: "step-3",
      phase: "during",
      icon: "warning",
      text: "Never walk or drive through moving floodwaters",
    },
    {
      id: "step-4",
      phase: "after",
      icon: "check",
      text: "Boil drinking water and check for electrical damage",
    },
  ],
};

function renderWithPreferences(ui: React.ReactElement) {
  return render(<PreferencesProvider initialLocale="en">{ui}</PreferencesProvider>);
}

describe("GuideSteps Component", () => {
  it("renders phase tabs and defaults to Before phase", () => {
    renderWithPreferences(<GuideSteps guide={mockGuide} locale="en" />);
    const beforeTab = screen.getByRole("tab", { name: /Before/i });
    expect(beforeTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Move valuables to upper floors")).toBeInTheDocument();
  });

  it("switches phases on tab click", () => {
    renderWithPreferences(<GuideSteps guide={mockGuide} locale="en" />);
    const duringTab = screen.getByRole("tab", { name: /During/i });
    fireEvent.click(duringTab);

    expect(duringTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Never walk or drive through moving floodwaters")).toBeInTheDocument();
  });

  it("supports keyboard navigation across phase tabs", () => {
    renderWithPreferences(<GuideSteps guide={mockGuide} locale="en" />);
    const beforeTab = screen.getByRole("tab", { name: /Before/i });
    beforeTab.focus();

    fireEvent.keyDown(beforeTab, { key: "ArrowRight" });
    const duringTab = screen.getByRole("tab", { name: /During/i });
    expect(duringTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(duringTab, { key: "End" });
    const afterTab = screen.getByRole("tab", { name: /After/i });
    expect(afterTab).toHaveAttribute("aria-selected", "true");
  });

  it("marks a step as read and updates progress text", () => {
    renderWithPreferences(<GuideSteps guide={mockGuide} locale="en" />);
    // Before has 2 steps, 0 completed initially
    expect(screen.getByText(/0 of 2 steps completed/i)).toBeInTheDocument();

    const checkbox = screen.getByLabelText(/Mark as read: Move valuables to upper floors/i);
    fireEvent.click(checkbox);

    expect(screen.getByText(/1 of 2 steps completed/i)).toBeInTheDocument();
  });
});
