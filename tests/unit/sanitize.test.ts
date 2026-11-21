import { describe, it, expect } from "vitest";
import { sanitizeHtml, sanitizeReport } from "@/lib/sanitize";

describe("Sanitization library (src/lib/sanitize.ts)", () => {
  it("removes script tags and their inner content", () => {
    const input = 'Bridge flooded <script>alert("hacked")</script> please be careful';
    expect(sanitizeHtml(input)).toBe("Bridge flooded please be careful");
  });

  it("removes style tags and their inner content", () => {
    const input = "Normal text <style>body { display: none; }</style> remaining note";
    expect(sanitizeHtml(input)).toBe("Normal text remaining note");
  });

  it("removes HTML tags but keeps inner plain text", () => {
    const input =
      "<p>Water level <strong>rising rapidly</strong> at <a href='https://evil.com'>River Bank</a>.</p>";
    expect(sanitizeHtml(input)).toBe("Water level rising rapidly at River Bank.");
  });

  it("strips ASCII control characters", () => {
    const input = "Road\u0000\u0007\u001B blocked\u007F near market";
    expect(sanitizeHtml(input)).toBe("Road blocked near market");
  });

  it("normalises whitespace and trims ends", () => {
    const input = "   Culvert    collapsed   under   heavy   rain.   \n\n  ";
    expect(sanitizeHtml(input)).toBe("Culvert collapsed under heavy rain.");
  });

  it("leaves Assamese and Hindi text unchanged", () => {
    const assamese = "পানী বাঢ়িছে আৰু ৰাস্তা বন্ধ হৈছে। সকলোৱে সাৱধান হওক।";
    const hindi = "नदी का जलस्तर खतरे के निशान से ऊपर है। सहायता दल पहुंच रहे हैं।";

    expect(sanitizeHtml(assamese)).toBe(assamese);
    expect(sanitizeHtml(hindi)).toBe(hindi);
  });

  it("handles empty or null-like strings gracefully", () => {
    expect(sanitizeHtml("")).toBe("");
    // @ts-expect-error test invalid types
    expect(sanitizeHtml(null)).toBe("");
    // @ts-expect-error test invalid types
    expect(sanitizeHtml(undefined)).toBe("");
  });

  it("sanitizeReport cleans both note and place fields", () => {
    const raw = {
      districtId: "dhemaji",
      type: "road_blocked" as const,
      note: "<b>Flooded</b> <script>steal()</script> NH-15",
      place: "<i>Bypass   road</i>",
    };

    const cleaned = sanitizeReport(raw);
    expect(cleaned.note).toBe("Flooded NH-15");
    expect(cleaned.place).toBe("Bypass road");
    expect(cleaned.districtId).toBe("dhemaji");
  });
});
