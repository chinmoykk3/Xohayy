import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button UI Primitive", () => {
  it("renders button with text and default variant", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: "Click Me" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("min-h-[48px]");
    expect(button.className).toContain("min-w-[48px]");
  });

  it("renders emergency variant with appropriate styles", () => {
    render(<Button variant="emergency">Emergency 112</Button>);
    const button = screen.getByRole("button", { name: "Emergency 112" });
    expect(button.className).toContain("bg-[var(--color-emergency-bg)]");
  });

  it("triggers onClick callback when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button and displays loading indicator when isLoading is true", () => {
    render(<Button isLoading>Save</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
