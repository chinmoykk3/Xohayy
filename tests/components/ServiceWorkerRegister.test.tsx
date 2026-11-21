import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import {
  ServiceWorkerRegister,
  hasUnsavedFormInput,
} from "@/components/layout/ServiceWorkerRegister";

describe("ServiceWorkerRegister Component (Phase 17, Section 21.7)", () => {
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    Object.defineProperty(navigator, "serviceWorker", {
      value: originalServiceWorker,
      writable: true,
      configurable: true,
    });
    document.body.innerHTML = "";
  });

  it("does not register service worker in test / development environment", () => {
    vi.stubEnv("NODE_ENV", "test");
    const registerMock = vi.fn().mockResolvedValue({ scope: "/" });

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: registerMock,
      },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("registers /sw.js with scope / in production environment", () => {
    vi.stubEnv("NODE_ENV", "production");
    const registerMock = vi.fn().mockResolvedValue({ scope: "/" });

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: registerMock,
      },
      writable: true,
      configurable: true,
    });

    render(<ServiceWorkerRegister />);
    expect(registerMock).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("displays update toast when a new worker is waiting", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const mockWaitingWorker = {
      postMessage: vi.fn(),
    };

    const registerMock = vi.fn().mockResolvedValue({
      scope: "/",
      waiting: mockWaitingWorker,
      addEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: registerMock,
        controller: {},
      },
      writable: true,
      configurable: true,
    });

    await act(async () => {
      render(<ServiceWorkerRegister />);
    });

    expect(screen.getByText("A new version is available.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("hasUnsavedFormInput correctly detects dirty form state", () => {
    document.body.innerHTML = `
      <form id="test-form">
        <input type="text" id="name-input" defaultValue="" />
      </form>
    `;

    expect(hasUnsavedFormInput()).toBe(false);

    const input = document.getElementById("name-input") as HTMLInputElement;
    input.value = "Unsaved report draft";
    expect(hasUnsavedFormInput()).toBe(true);

    input.value = "";
    expect(hasUnsavedFormInput()).toBe(false);
  });

  it("blocks reload and shows warning toast if a form has unsaved input on Refresh tap", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const mockWaitingWorker = {
      postMessage: vi.fn(),
    };

    const registerMock = vi.fn().mockResolvedValue({
      scope: "/",
      waiting: mockWaitingWorker,
      addEventListener: vi.fn(),
    });

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: registerMock,
        controller: {},
      },
      writable: true,
      configurable: true,
    });

    // Create a form with unsaved input
    const form = document.createElement("form");
    const input = document.createElement("input");
    input.type = "text";
    input.defaultValue = "";
    input.value = "Important ground report input";
    form.appendChild(input);
    document.body.appendChild(form);

    await act(async () => {
      render(<ServiceWorkerRegister />);
    });

    const refreshBtn = screen.getByRole("button", { name: "Refresh" });
    fireEvent.click(refreshBtn);

    // Refresh should not postMessage or reload because form is dirty
    expect(mockWaitingWorker.postMessage).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Please save or submit your open form before refreshing\./i)
    ).toBeInTheDocument();
  });
});
