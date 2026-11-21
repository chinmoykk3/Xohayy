import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Offline Fallback Page (public/offline.html)", () => {
  const offlineHtmlPath = path.resolve(process.cwd(), "public/offline.html");
  const htmlContent = fs.readFileSync(offlineHtmlPath, "utf-8");

  it("exists and is valid HTML", () => {
    expect(fs.existsSync(offlineHtmlPath)).toBe(true);
    expect(htmlContent.toLowerCase().startsWith("<!doctype html>")).toBe(true);
  });

  it("contains direct tel: link for National Emergency Helpline 112", () => {
    expect(htmlContent).toContain('href="tel:112"');
    expect(htmlContent).toContain("112");
  });

  it("contains all core emergency helplines as tel: links", () => {
    expect(htmlContent).toContain('href="tel:108"'); // Ambulance
    expect(htmlContent).toContain('href="tel:101"'); // Fire
    expect(htmlContent).toContain('href="tel:100"'); // Police
    expect(htmlContent).toContain('href="tel:1070"'); // Disaster management
    expect(htmlContent).toContain('href="tel:1079"'); // Flood control
  });

  it("contains multi-lingual descriptions in English, Assamese and Hindi", () => {
    // English
    expect(htmlContent).toContain("National Emergency Number");
    expect(htmlContent).toContain("No Internet Connection");

    // Assamese
    expect(htmlContent).toContain("ৰাষ্ট্ৰীয় জৰুৰীকালীন সাহায্য");
    expect(htmlContent).toContain("অফলাইন");
    expect(htmlContent).toContain("পুনৰ চেষ্টা কৰক");

    // Hindi
    expect(htmlContent).toContain("राष्ट्रीय आपातकालीन हेल्पलाइन");
    expect(htmlContent).toContain("ऑफ़लाइन");
    expect(htmlContent).toContain("पुनः प्रयास करें");
  });

  it("contains a functional connection retry mechanism", () => {
    expect(htmlContent).toContain('id="retry-link"');
    expect(htmlContent).toContain("window.location.reload()");
  });
});
