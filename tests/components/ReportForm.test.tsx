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
    vi.useRealTimers();
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
    expect(errorSummary).toHaveTextContent(
      /Please select a condition type from the options above/i
    );
    expect(errorSummary).toHaveTextContent(/Please choose the affected district/i);
    expect(errorSummary).toHaveTextContent(/Please describe the situation/i);

    // Field errors linked via aria-describedby
    const typeError = document.getElementById("report-type-error");
    expect(typeError).toBeInTheDocument();
    expect(typeError).toHaveTextContent(/Please select a condition type from the options above/i);

    const districtError = document.getElementById("report-district-error");
    expect(districtError).toBeInTheDocument();
    expect(districtError).toHaveTextContent(/Please choose the affected district/i);
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
    const noteError = document.getElementById("report-note-error");
    expect(noteError).toBeInTheDocument();
    expect(noteError).toHaveTextContent(/Please describe the situation/i);
  });

  it("announces character counter politely and not on every keystroke", async () => {
    vi.useFakeTimers();
    renderForm();

    const textInput = "Water rising rapidly near house"; // 31 characters
    const noteArea = screen.getByLabelText(/Description of Situation/i);
    fireEvent.change(noteArea, { target: { value: textInput } });

    // Immediate visual counter updates
    expect(screen.getByText("31 / 200")).toBeInTheDocument();

    // The screen reader polite status is debounced and not yet 31
    const politeRegion = screen.getByText(/0 of 200 characters entered/i);
    expect(politeRegion).toBeInTheDocument();

    // Fast-forward debounce timer (1000ms)
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText("31 of 200 characters entered")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("ensures honeypot field is visually hidden and NOT reachable via keyboard tabbing", () => {
    renderForm();

    const honeypot = screen.getByLabelText(/Leave this blank/i);

    // Honeypot must have tabIndex = -1 to be excluded from tab order
    expect(honeypot).toHaveAttribute("tabindex", "-1");

    // Parent container must have aria-hidden="true" to be excluded from accessibility tree
    const parentContainer = honeypot.closest("[aria-hidden='true']") as HTMLElement;
    expect(parentContainer).not.toBeNull();
    expect(parentContainer.style.pointerEvents).toBe("none");
    expect(parentContainer.style.opacity).toBe("0");
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
    const statusMsg = await screen.findByText(/Report submitted successfully/i);
    expect(statusMsg).toBeInTheDocument();
    const statusContainer = document.getElementById("report-submission-status");
    expect(statusContainer).toHaveAttribute("role", "status");
    expect(statusContainer).toHaveTextContent(/moderated by authorized staff/i);
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
    const queuedText = await screen.findByText(
      /Saved on your phone. It will be sent when you are online/i
    );
    expect(queuedText).toBeInTheDocument();
    const queuedContainer = document.getElementById("report-queued-status");
    expect(queuedContainer).toHaveAttribute("role", "status");

    // Verify item is in IndexedDB
    const queuedItems = await getQueuedReports();
    expect(queuedItems).toHaveLength(1);
    expect(queuedItems[0]?.districtId).toBe("majuli");
    expect(queuedItems[0]?.type).toBe("area_flooded");
    expect(queuedItems[0]?.note).toBe("Brahmaputra water entered lower paddy fields.");
  });
});
