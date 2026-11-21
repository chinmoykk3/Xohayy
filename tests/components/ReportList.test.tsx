import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportList } from "@/components/report/ReportList";
import type { Report } from "@/types";

const mockReports: Report[] = [
  {
    id: "rep-1",
    districtId: "dhemaji",
    type: "road_blocked",
    note: "Silapathar highway submerged under 1.5 ft water.",
    place: "Mile 12, NH-15",
    status: "approved",
    createdAt: "2026-11-21T09:00:00Z",
    clientHash: "hash-1",
  },
  {
    id: "rep-2",
    districtId: "majuli",
    type: "need_help",
    note: "Stranded ferry passengers awaiting boat.",
    place: "Kamalabari Ghat",
    status: "approved",
    createdAt: "2026-11-21T08:00:00Z",
    clientHash: "hash-2",
  },
  {
    id: "rep-3",
    districtId: "lakhimpur",
    type: "area_flooded",
    note: "Embankment breach reported near Subansiri.",
    status: "approved",
    createdAt: "2026-11-21T07:00:00Z",
    clientHash: "hash-3",
  },
  {
    id: "rep-4-pending",
    districtId: "dhemaji",
    type: "landslide",
    note: "Pending review report",
    status: "pending",
    createdAt: "2026-11-21T09:30:00Z",
    clientHash: "hash-4",
  },
];

describe("ReportList Component (Phase 19)", () => {
  it("renders approved reports with semantic list and listitem roles, type, district, and time", () => {
    render(<ReportList reports={mockReports} locale="en" />);

    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();

    const items = screen.getAllByRole("listitem");
    // Only approved reports (3 items) should be displayed
    expect(items).toHaveLength(3);

    expect(
      screen.getByText("Silapathar highway submerged under 1.5 ft water.")
    ).toBeInTheDocument();
    expect(screen.getByText("Mile 12, NH-15")).toBeInTheDocument();
    expect(screen.getByText("Dhemaji")).toBeInTheDocument();
    expect(screen.getByText("Road Blocked")).toBeInTheDocument();

    // Pending report must not be visible
    expect(screen.queryByText("Pending review report")).not.toBeInTheDocument();
  });

  it("limits the number of displayed reports when limit prop is provided", () => {
    render(<ReportList reports={mockReports} locale="en" limit={2} />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("renders calm empty state when no approved reports exist", () => {
    render(<ReportList reports={[]} locale="en" />);
    expect(screen.getByText(/No reports submitted in this area recently/i)).toBeInTheDocument();
  });
});
