import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorFallback } from "@/components/common/ErrorFallback";

describe("ErrorFallback Component (Phase 24, Task 4)", () => {
  it("renders calm message and 112 emergency helpline in English", () => {
    const reset = vi.fn();
    const error = new Error("Test error message");

    render(<ErrorFallback error={error} reset={reset} locale="en" />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected technical issue/i)).toBeInTheDocument();

    // 112 call link
    const call112 = screen.getByRole("link", { name: /Call 112/i });
    expect(call112).toBeInTheDocument();
    expect(call112).toHaveAttribute("href", "tel:112");

    // State & District helplines
    expect(screen.getByRole("link", { name: /State EOC: 1070/i })).toHaveAttribute(
      "href",
      "tel:1070"
    );
    expect(screen.getByRole("link", { name: /District DEOC: 1077/i })).toHaveAttribute(
      "href",
      "tel:1077"
    );
  });

  it("renders localized Assamese and Hindi messages", () => {
    const reset = vi.fn();
    const error = new Error("Test error message");

    const { rerender } = render(<ErrorFallback error={error} reset={reset} locale="as" />);
    expect(screen.getByText("এক অপ্ৰত্যাশিত সমস্যা হৈছে")).toBeInTheDocument();

    rerender(<ErrorFallback error={error} reset={reset} locale="hi" />);
    expect(screen.getByText("कुछ गलत हो गया")).toBeInTheDocument();
  });

  it("calls reset when Try Again button is clicked", () => {
    const reset = vi.fn();
    const error = new Error("Test error message");

    render(<ErrorFallback error={error} reset={reset} locale="en" />);

    const retryBtn = screen.getByRole("button", { name: /Try again/i });
    fireEvent.click(retryBtn);

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
