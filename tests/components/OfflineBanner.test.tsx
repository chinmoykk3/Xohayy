import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import {
  __setOnlineStatusForTesting,
  __resetOnlineStatusForTesting,
} from "@/hooks/useOnlineStatus";
import { setLastFetchedAt } from "@/lib/fetcher";

describe("OfflineBanner Component (Phase 17, Task 2 & 7)", () => {
  beforeEach(() => {
    __resetOnlineStatusForTesting();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    __resetOnlineStatusForTesting();
    vi.restoreAllMocks();
  });

  it("does not render when online status is true", () => {
    act(() => {
      __setOnlineStatusForTesting(true);
    });

    const { container } = render(<OfflineBanner locale="en" />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows when status becomes false with role status and aria-live polite", () => {
    act(() => {
      __setOnlineStatusForTesting(false);
    });

    render(<OfflineBanner locale="en" />);

    const banner = screen.getByRole("status");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveAttribute("aria-live", "polite");
    expect(banner).toHaveTextContent(/You are offline\. Showing saved information/i);
  });

  it("displays saved information timestamp accurately from prop or storage", () => {
    act(() => {
      __setOnlineStatusForTesting(false);
    });
    setLastFetchedAt("2026-11-21T10:30:00.000Z");

    render(<OfflineBanner locale="en" />);

    const banner = screen.getByRole("status");
    expect(banner).toHaveTextContent(/You are offline\. Showing saved information from/i);
    expect(banner).toHaveTextContent(/2026/);
  });

  it("appears and disappears dynamically when status transitions", () => {
    act(() => {
      __setOnlineStatusForTesting(true);
    });

    render(<OfflineBanner locale="en" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    // Transition to offline
    act(() => {
      __setOnlineStatusForTesting(false);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();

    // Transition back to online
    act(() => {
      __setOnlineStatusForTesting(true);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders localized text for Assamese and Hindi", () => {
    act(() => {
      __setOnlineStatusForTesting(false);
    });

    const { rerender } = render(<OfflineBanner locale="as" />);
    expect(screen.getByRole("status")).toHaveTextContent(/আপুনি অফলাইনত আছে/);

    rerender(<OfflineBanner locale="hi" />);
    expect(screen.getByRole("status")).toHaveTextContent(/आप ऑफ़लाइन हैं/);
  });
});
