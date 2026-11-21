import { describe, expect, it } from "vitest";
import { formatEmergencyTitle } from "@/lib/sample";

describe("formatEmergencyTitle", () => {
  it("formats emergency title with given service name", () => {
    expect(formatEmergencyTitle("Disaster Control")).toBe("Disaster Control - Emergency");
  });

  it("handles empty service string gracefully with fallback", () => {
    expect(formatEmergencyTitle("")).toBe("Emergency Services");
  });
});
