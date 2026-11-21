import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RiskBadge } from "@/components/alerts/RiskBadge";
import type { RiskLevel } from "@/types";

describe("RiskBadge Component", () => {
  const levels: RiskLevel[] = ["low", "moderate", "high", "severe"];

  it.each(levels)("renders text label and icon for risk level '%s'", (level) => {
    const { container } = render(<RiskBadge level={level} locale="en" />);

    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-risk-level", level);

    // Verify SVG icon exists so it never relies on colour alone
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // Verify text label is not empty
    expect(badge.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("renders localized labels in Assamese and Hindi", () => {
    const { rerender } = render(<RiskBadge level="severe" locale="en" />);
    expect(screen.getByText("Danger (Severe)")).toBeInTheDocument();

    rerender(<RiskBadge level="severe" locale="as" />);
    expect(screen.getByText(/চৰম বিপদ/i)).toBeInTheDocument();

    rerender(<RiskBadge level="severe" locale="hi" />);
    expect(screen.getByText(/खतरा/i)).toBeInTheDocument();
  });

  it("applies correct risk token styling classes without relying on color alone", () => {
    const { container: lowContainer } = render(<RiskBadge level="low" />);
    expect(lowContainer.firstChild).toHaveClass("bg-[var(--color-risk-low-bg)]");

    const { container: highContainer } = render(<RiskBadge level="high" />);
    expect(highContainer.firstChild).toHaveClass("bg-[var(--color-risk-warning-bg)]");

    const { container: severeContainer } = render(<RiskBadge level="severe" />);
    expect(severeContainer.firstChild).toHaveClass("bg-[var(--color-risk-danger-bg)]");
  });
});
