import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CallButton } from "@/components/emergency/CallButton";

describe("CallButton Component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders an anchor with a tel: href and accessible name containing label and number", () => {
    render(<CallButton label="National Emergency" number="112" size="lg" variant="emergency" />);

    const link = screen.getByRole("link", { name: /National Emergency 112/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "tel:112");
  });

  it("renders large emergency styling for 112 priority", () => {
    const { container } = render(
      <CallButton label="Emergency Priority" number="112" size="lg" variant="emergency" />
    );

    expect(container.firstChild).toHaveClass("bg-[var(--color-emergency-bg)]");
    const link = screen.getByRole("link");
    expect(link).toHaveClass("min-h-[64px]");
  });

  it("copies number to clipboard and provides accessible feedback", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(<CallButton label="Police" number="100" />);

    const copyBtn = screen.getByRole("button", { name: /Copy Number 100/i });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith("100");
  });
});
