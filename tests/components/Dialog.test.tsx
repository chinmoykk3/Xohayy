import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog } from "@/components/ui/Dialog";

function DialogHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button type="button" id="trigger-btn" onClick={() => setIsOpen(true)}>
        Open Dialog
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Emergency Info"
        description="Critical instructions"
      >
        <div>
          <button type="button" id="first-dialog-btn">
            First Action
          </button>
          <button type="button" id="second-dialog-btn">
            Second Action
          </button>
        </div>
      </Dialog>
    </div>
  );
}

describe("Dialog UI Primitive", () => {
  it("renders dialog content when open and hides when closed", () => {
    const { rerender } = render(
      <Dialog isOpen={false} onClose={() => {}} title="Test Dialog">
        Content
      </Dialog>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Dialog isOpen={true} onClose={() => {}} title="Test Dialog">
        Content
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog")).toBeInTheDocument();
  });

  it("closes when Escape key is pressed", () => {
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Open Dialog" });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps focus within the dialog on Tab and Shift+Tab", () => {
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Open Dialog" });
    fireEvent.click(trigger);

    const closeBtn = screen.getByRole("button", { name: "Close dialog" });
    const firstBtn = screen.getByRole("button", { name: "First Action" });
    const secondBtn = screen.getByRole("button", { name: "Second Action" });

    // Close button should be initially focused
    expect(document.activeElement).toBe(closeBtn);

    // Tab forwards
    fireEvent.keyDown(document, { key: "Tab" });
    firstBtn.focus();
    expect(document.activeElement).toBe(firstBtn);

    // Tab to last element
    fireEvent.keyDown(document, { key: "Tab" });
    secondBtn.focus();
    expect(document.activeElement).toBe(secondBtn);

    // Tab from last element wraps back to first element (close button)
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab from close button wraps to last element (second button)
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(secondBtn);
  });

  it("returns focus to trigger element when closed", () => {
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Open Dialog" });
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Close dialog via Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Focus restored to trigger
    expect(document.activeElement).toBe(trigger);
  });
});
