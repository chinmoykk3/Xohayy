import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

describe("Web App Manifest (ADR-003, Section 21.2)", () => {
  it("provides valid metadata conforming to PWA standards", () => {
    const data = manifest();

    expect(data.name).toBe("Xahay");
    expect(data.short_name).toBe("Xahay");
    expect(data.start_url).toBe("/en/");
    expect(data.scope).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.orientation).toBe("portrait-primary");
    expect(data.theme_color).toBe("#0369a1");
    expect(data.background_color).toBe("#f7fafc");
    expect(data.description).toBeDefined();
    expect(typeof data.description).toBe("string");
  });

  it("includes required 192, 512, and 512 maskable PNG icons", () => {
    const data = manifest();
    const icons = data.icons || [];

    const icon192 = icons.find((i) => i.sizes === "192x192");
    expect(icon192).toBeDefined();
    expect(icon192?.src).toBe("/icons/icon-192.png");
    expect(icon192?.type).toBe("image/png");

    const icon512 = icons.find((i) => i.sizes === "512x512" && !i.purpose);
    expect(icon512).toBeDefined();
    expect(icon512?.src).toBe("/icons/icon-512.png");
    expect(icon512?.type).toBe("image/png");

    const iconMaskable = icons.find((i) => i.sizes === "512x512" && i.purpose === "maskable");
    expect(iconMaskable).toBeDefined();
    expect(iconMaskable?.src).toBe("/icons/icon-maskable-512.png");
  });

  it("includes shortcuts for Emergency numbers, Safety guides and Shelters", () => {
    const data = manifest();
    const shortcuts = data.shortcuts || [];

    expect(shortcuts.length).toBe(3);

    const emergencyShortcut = shortcuts.find((s) => s.name === "Emergency numbers");
    expect(emergencyShortcut).toBeDefined();
    expect(emergencyShortcut?.url).toBe("/en/emergency");

    const guidesShortcut = shortcuts.find((s) => s.name === "Safety guides");
    expect(guidesShortcut).toBeDefined();
    expect(guidesShortcut?.url).toBe("/en/guides");

    const sheltersShortcut = shortcuts.find((s) => s.name === "Shelters");
    expect(sheltersShortcut).toBeDefined();
    expect(sheltersShortcut?.url).toBe("/en/shelters");
  });
});
