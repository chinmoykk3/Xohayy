import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AlertCard } from "@/components/alerts/AlertCard";
import type { Alert } from "@/types";

const sampleAlert: Alert = {
  id: "alert-001",
  districtId: "dhemaji",
  hazard: "flood",
  risk: "severe",
  title: {
    en: "Jiadhal River Overflow",
    as: "জিয়াঢল নদীৰ বান সতৰ্কতা",
    hi: "जियाधल नदी में भीषण बाढ़ की चेतावनी",
  },
  message: {
    en: "Water level breached danger mark by 1.2 meters.",
    as: "পানীৰ স্তৰ বিপদসীমাতকৈ ১.২ মিটাৰ ওপৰত বৈছে।",
    hi: "जलस्तर खतरे के निशान से 1.2 मीटर ऊपर।",
  },
  source: "ASDMA Demo",
  isDemo: true,
  issuedAt: "2026-11-21T05:00:00Z",
  validUntil: "2026-11-24T18:00:00Z",
};

const expiredAlert: Alert = {
  ...sampleAlert,
  id: "alert-expired",
  validUntil: "2020-01-01T00:00:00Z",
};

describe("AlertCard Component", () => {
  it("renders title, message, hazard, source and risk badge", () => {
    render(<AlertCard alert={sampleAlert} locale="en" />);

    expect(screen.getByText("Jiadhal River Overflow")).toBeInTheDocument();
    expect(screen.getByText("Water level breached danger mark by 1.2 meters.")).toBeInTheDocument();
    expect(screen.getByText(/flood/i)).toBeInTheDocument();
    expect(screen.getByText(/ASDMA Demo/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute("data-risk-level", "severe");
  });

  it("renders demo tag when isDemo is true", () => {
    render(<AlertCard alert={sampleAlert} locale="en" />);
    expect(screen.getByText("Demo Data")).toBeInTheDocument();
  });

  it("renders expired tag when alert has passed validUntil date", () => {
    render(<AlertCard alert={expiredAlert} locale="en" />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("renders localized title and message in Assamese and Hindi", () => {
    const { rerender } = render(<AlertCard alert={sampleAlert} locale="as" />);
    expect(screen.getByText("জিয়াঢল নদীৰ বান সতৰ্কতা")).toBeInTheDocument();

    rerender(<AlertCard alert={sampleAlert} locale="hi" />);
    expect(screen.getByText("जियाधल नदी में भीषण बाढ़ की चेतावनी")).toBeInTheDocument();
  });
});
