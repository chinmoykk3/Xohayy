import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmergencyPanel } from "@/components/emergency/EmergencyPanel";
import { PreferencesProvider } from "@/context/PreferencesContext";
import axe from "axe-core";

describe("EmergencyPanel Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders 112 as the primary prominent call button", () => {
    render(
      <PreferencesProvider initialLocale="en">
        <EmergencyPanel isOpen={true} onClose={vi.fn()} locale="en" />
      </PreferencesProvider>
    );

    const nationalLink = screen.getByRole("link", { name: /112/i });
    expect(nationalLink).toBeInTheDocument();
    expect(nationalLink).toHaveAttribute("href", "tel:112");
  });

  it("renders core emergency helplines and district control room", () => {
    render(
      <PreferencesProvider initialLocale="en">
        <EmergencyPanel isOpen={true} onClose={vi.fn()} locale="en" />
      </PreferencesProvider>
    );

    expect(screen.getByRole("link", { name: /108/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /100/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /101/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /1070/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /1077/i })).toBeInTheDocument();
  });

  it("closes with Escape key", () => {
    const handleClose = vi.fn();
    render(
      <PreferencesProvider initialLocale="en">
        <EmergencyPanel isOpen={true} onClose={handleClose} locale="en" />
      </PreferencesProvider>
    );

    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("passes axe accessibility audit with zero serious/critical violations", async () => {
    const { container } = render(
      <PreferencesProvider initialLocale="en">
        <EmergencyPanel isOpen={true} onClose={vi.fn()} locale="en" />
      </PreferencesProvider>
    );

    const results = await axe.run(container, {
      rules: {
        // In jsdom without stylesheets, color-contrast cannot compute computed styles
        "color-contrast": { enabled: false },
      },
    });

    const seriousViolations = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );
    expect(seriousViolations).toEqual([]);
  });
});
