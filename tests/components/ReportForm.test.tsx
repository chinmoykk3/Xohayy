import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "fake-indexeddb/auto";
import { ReportForm } from "@/components/report/ReportForm";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { clearQueue, getQueuedReports } from "@/lib/offlineQueue";

function renderForm(locale: "en" | "as" | "hi" = "en") {
  return render(
    <PreferencesProvider initialLocale={locale}>
      <ReportForm locale={locale} />
    </PreferencesProvider>
  );
}

describe("ReportForm Component (Phase 19)", () => {
  beforeEach(async () => {
    await clearQueue();
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: "rep-123", status: "pending" }),
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows field errors next to fields and in the error summary at the top on empty submit", async () => {
    renderForm();

    const submitBtn = screen.getByRole("button", { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    // API must NOT be called on invalid data
    expect(global.fetch).not.toHaveBeenCalled();

    // Error summary at the top
    const errorSummary = screen.getByRole("alert", {
      name: /There is a problem with your submission/i,
    });
    expect(errorSummary).toBeInTheDocument();

    // Specific field errors (exist in both error summary and beside input)
    expect(
      screen.getAllByText(/Please select a condition type from the options above/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Please choose the affected district/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Please describe the situation \(between 1 and 200 characters\)/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("does not submit when note is invalid (empty or whitespace only)", async () => {
    renderForm();

    // Select type
    const roadBlockedRadio = screen.getByLabelText(/Road Blocked/i);
    fireEvent.click(roadBlockedRadio);

    // Select district
    const districtSelect = screen.getByLabelText(/District/i);
    fireEvent.change(districtSelect, { target: { value: "dhemaji" } });

    // Enter empty whitespace note
    const noteArea = screen.getByLabelText(/Description of Situation/i);
    fireEvent.change(noteArea, { target: { value: "   " } });

    const submitBtn = screen.getByRole("button", { name: /Submit Report/i });
    fireEvent.click(submitBtn);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(
      screen.getAllByText(/Please describe the situation \(between 1 and 200 characters\)/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("announces character counter politely and not on every keystroke", async () => {
    vi.useFakeTimers();
    renderForm();

    const noteArea = screen.getByLabelText(/Description of Situation/i);
    fireEvent.change(noteArea, { target: { value: "Water rising rapidly near houses" } });

    // Immediate visual counter updates (32 chars)
    expect(screen.getByText("32 / 200")).toBeInTheDocument();

    // The screen reader polite status is debounced and not yet 32
    const politeRegion = screen.getByText(/0 of 200 characters entered/i);
    expect(politeRegion).toBeInTheDocument();

    // Fast-forward debounce timer (1000ms)
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText("32 of 200 characters entered")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("ensures honeypot field is visually hidden and NOT reachable via keyboard tabbing", async () => {
    renderForm();

    const honeypot = screen.getByLabelText(/Leave this blank/i);

    // Honeypot must have tabIndex = -1
    expect(honeypot).toHaveAttribute("tabindex", "-1");

    // Parent container must have aria-hidden="true"
    const parentContainer = honeypot.closest("[aria-hidden='true']");
    expect(parentContainer).not.toBeNull();
  });

  it("successfully submits online and displays role=status confirmation explaining review", async () => {
    renderForm();

    // Select type
    fireEvent.click(screen.getByLabelText(/Road Blocked/i));

    // Select district
    fireEvent.change(screen.getByLabelText(/District/i), { target: { value: "dhemaji" } });

    // Optional place
    fireEvent.change(screen.getByLabelText(/Location \/ Landmark \(Optional\)/i), {
      target: { value: "Near KM 18 Highway" },
    });

    // Enter note
    fireEvent.change(screen.getByLabelText(/Description of Situation/i), {
      target: { value: "Water flowing 2 feet deep over the culvert." },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Submit Report/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/reports",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            districtId: "dhemaji",
            type: "road_blocked",
            note: "Water flowing 2 feet deep over the culvert.",
            place: "Near KM 18 Highway",
            honeypot: "",
          }),
        })
      );
    });

    // Success banner with role="status"
    const successHeading = await screen.findByText(/Report submitted successfully/i);
    expect(successHeading).toBeInTheDocument();
    const statusMsg = successHeading.closest("[role='status']");
    expect(statusMsg).not.toBeNull();
    expect(statusMsg).toHaveTextContent(/Report submitted successfully/i);
    expect(statusMsg).toHaveTextContent(/moderated by authorized staff/i);
  });

  it("stores report into offline IndexedDB queue when offline and shows confirmation", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    renderForm();

    // Fill form
    fireEvent.click(screen.getByLabelText(/Area Flooded/i));
    fireEvent.change(screen.getByLabelText(/District/i), { target: { value: "majuli" } });
    fireEvent.change(screen.getByLabelText(/Description of Situation/i), {
      target: { value: "Brahmaputra water entered lower paddy fields." },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /Submit Report/i }));

    // Fetch should not be called while offline
    expect(global.fetch).not.toHaveBeenCalled();

    // Status message for offline queue
    const queuedHeading = await screen.findByText(
      /Saved on your phone. It will be sent when you are online/i
    );
    expect(queuedHeading).toBeInTheDocument();
    const queuedStatus = queuedHeading.closest("[role='status']");
    expect(queuedStatus).not.toBeNull();

    // Verify item is in IndexedDB
    const queuedItems = await getQueuedReports();
    expect(queuedItems).toHaveLength(1);
    expect(queuedItems[0]?.districtId).toBe("majuli");
    expect(queuedItems[0]?.type).toBe("area_flooded");
    expect(queuedItems[0]?.note).toBe("Brahmaputra water entered lower paddy fields.");
  });
});
