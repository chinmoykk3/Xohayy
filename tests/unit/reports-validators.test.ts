import { describe, it, expect } from "vitest";
import { createReportSchema, SEEDED_DISTRICT_IDS } from "@/lib/validators";

describe("Report validators (Task 1 & Section 26.2)", () => {
  const validReport = {
    districtId: "dhemaji",
    type: "road_blocked",
    note: "Water overflowing onto NH-15 near Sisiborgaon. Small vehicles cannot pass.",
    place: "Sisiborgaon Bypass",
    honeypot: "",
  };

  it("accepts a valid report", () => {
    const result = createReportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.districtId).toBe("dhemaji");
      expect(result.data.type).toBe("road_blocked");
      expect(result.data.note).toContain("Water overflowing");
      expect(result.data.place).toBe("Sisiborgaon Bypass");
    }
  });

  it("accepts a report without optional place", () => {
    const noPlace = { ...validReport };
    delete (noPlace as { place?: string }).place;
    const result = createReportSchema.safeParse(noPlace);
    expect(result.success).toBe(true);
  });

  it("accepts all seeded districts", () => {
    for (const districtId of SEEDED_DISTRICT_IDS) {
      const result = createReportSchema.safeParse({
        ...validReport,
        districtId,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an unknown districtId", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      districtId: "new-york",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("districtId");
    }
  });

  it("rejects an unknown report type", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      type: "meteor_strike",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("type");
    }
  });

  it("rejects an empty note", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      note: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("note");
    }
  });

  it("rejects a note over 200 characters", () => {
    const longNote = "a".repeat(201);
    const result = createReportSchema.safeParse({
      ...validReport,
      note: longNote,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("note");
    }
  });

  it("rejects a place over 80 characters", () => {
    const longPlace = "b".repeat(81);
    const result = createReportSchema.safeParse({
      ...validReport,
      place: longPlace,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path[0]);
      expect(paths).toContain("place");
    }
  });

  it("rejects non-string values for text fields", () => {
    expect(createReportSchema.safeParse({ ...validReport, note: 12345 }).success).toBe(false);
    expect(createReportSchema.safeParse({ ...validReport, districtId: ["dhemaji"] }).success).toBe(
      false
    );
    expect(
      createReportSchema.safeParse({ ...validReport, type: { value: "road_blocked" } }).success
    ).toBe(false);
    expect(createReportSchema.safeParse({ ...validReport, place: true }).success).toBe(false);
  });

  it("rejects notes containing Indian phone number patterns with a friendly privacy message", () => {
    const phoneNotes = [
      "Please call me at 9876543210 immediately for rescue",
      "Contact volunteer at +91 98765 43210",
      "Phone number +91-9876543210 for food packets",
      "Reach out to 0361-2345678",
      "Mobile: 8765432109",
    ];

    for (const note of phoneNotes) {
      const result = createReportSchema.safeParse({
        ...validReport,
        note,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "note");
        expect(issue).toBeDefined();
        expect(issue?.message.toLowerCase()).toContain("phone");
      }
    }
  });

  it("does not reject normal road numbers or quantities in notes", () => {
    const benignNotes = [
      "NH-15 submerged near bridge 4. Over 50 people waiting on embankment.",
      "Ward 7 under 3 feet of water. 2 relief boats active.",
      "Road 52 blocked by landslide near pillar 10.",
    ];

    for (const note of benignNotes) {
      const result = createReportSchema.safeParse({
        ...validReport,
        note,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects notes containing email patterns with a friendly privacy message", () => {
    const emailNotes = [
      "Send relief list to helper@gmail.com",
      "Contact me at rescue_team@assam.gov.in for updates",
      "Email: user.name+tag@domain.org",
    ];

    for (const note of emailNotes) {
      const result = createReportSchema.safeParse({
        ...validReport,
        note,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path[0] === "note");
        expect(issue).toBeDefined();
        expect(issue?.message.toLowerCase()).toContain("email");
      }
    }
  });

  it("identifies honeypot values", () => {
    const botReport = {
      ...validReport,
      honeypot: "http://spam-link.example.com",
    };
    const result = createReportSchema.safeParse(botReport);
    // Honeypot schema can either fail validation or allow detection in the handler
    // We test that honeypot field is parsed and can be inspected
    if (result.success) {
      expect(result.data.honeypot).toBe("http://spam-link.example.com");
    } else {
      expect(result.error.issues.some((i) => i.path[0] === "honeypot")).toBe(true);
    }
  });
});
