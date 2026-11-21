import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { checkContrast, calculateContrastRatio } from "@/lib/contrast";

describe("Accessibility Color Contrast Check (WCAG 2.2 AA)", () => {
  const tokenPairs = [
    {
      name: "Body Text on Page Background",
      foreground: "#0F172A",
      background: "#F7FAFC",
      requiredRatio: 4.5,
    },
    {
      name: "Body Text on Card Background",
      foreground: "#0F172A",
      background: "#FFFFFF",
      requiredRatio: 4.5,
    },
    {
      name: "Muted Text on Page Background",
      foreground: "#334155",
      background: "#F7FAFC",
      requiredRatio: 4.5,
    },
    {
      name: "Muted Text on Card Background",
      foreground: "#334155",
      background: "#FFFFFF",
      requiredRatio: 4.5,
    },
    {
      name: "Placeholder Text on Card Background",
      foreground: "#475569",
      background: "#FFFFFF",
      requiredRatio: 4.5,
    },
    {
      name: "Emergency Button Text on Emergency Red",
      foreground: "#FFFFFF",
      background: "#B91C1C",
      requiredRatio: 4.5,
    },
    {
      name: "Primary Button Text on Primary Sky-Blue",
      foreground: "#FFFFFF",
      background: "#0369A1",
      requiredRatio: 4.5,
    },
    {
      name: "Risk Low (Green) Text on Background",
      foreground: "#14532D",
      background: "#DCFCE7",
      requiredRatio: 4.5,
    },
    {
      name: "Risk Watch (Yellow) Text on Background",
      foreground: "#713F12",
      background: "#FEF9C3",
      requiredRatio: 4.5,
    },
    {
      name: "Risk Warning (Orange) Text on Background",
      foreground: "#7C2D12",
      background: "#FFEDD5",
      requiredRatio: 4.5,
    },
    {
      name: "Risk Danger (Red) Text on Background",
      foreground: "#7F1D1D",
      background: "#FEE2E2",
      requiredRatio: 4.5,
    },
    {
      name: "Focus Ring on Page Background",
      foreground: "#0284C7",
      background: "#F7FAFC",
      requiredRatio: 3.0,
    },
    {
      name: "Focus Ring on Card Background",
      foreground: "#0284C7",
      background: "#FFFFFF",
      requiredRatio: 3.0,
    },
    {
      name: "High Contrast Text on High Contrast Background",
      foreground: "#000000",
      background: "#FFFFFF",
      requiredRatio: 7.0,
    },
  ];

  it("calculates contrast ratio mathematically correctly", () => {
    // Pure black on pure white is 21:1
    expect(calculateContrastRatio("#000000", "#FFFFFF")).toBe(21);
    // Same colors is 1:1
    expect(calculateContrastRatio("#FFFFFF", "#FFFFFF")).toBe(1);
  });

  it("validates every design token pair satisfies WCAG minimum contrast ratio", () => {
    const results = tokenPairs.map((pair) =>
      checkContrast(pair.name, pair.foreground, pair.background, pair.requiredRatio)
    );

    const failures = results.filter((r) => !r.pass);
    expect(failures).toEqual([]);
  });

  it("generates markdown contrast audit table into docs/accessibility-report.md", () => {
    const results = tokenPairs.map((pair) =>
      checkContrast(pair.name, pair.foreground, pair.background, pair.requiredRatio)
    );

    let markdown = `# Accessibility & Contrast Audit Report (WCAG 2.2 AA)\n\n`;
    markdown += `This report verifies all design token pairs against WCAG 2.2 AA requirements (4.5:1 for body and normal text, 3:1 for focus indicators and large text).\n\n`;
    markdown += `| Token Pair | Foreground | Background | Measured Ratio | Required Ratio | Status |\n`;
    markdown += `| :--- | :---: | :---: | :---: | :---: | :---: |\n`;

    for (const r of results) {
      markdown += `| ${r.name} | \`${r.foreground}\` | \`${r.background}\` | **${r.ratio}:1** | ${r.requiredRatio}:1 | ${r.pass ? "✅ PASS" : "❌ FAIL"} |\n`;
    }

    markdown += `\n*All measurements generated automatically by \`tests/unit/contrast.test.ts\` via \`src/lib/contrast.ts\`.*\n`;

    const reportPath = path.resolve(process.cwd(), "docs/accessibility-report.md");
    fs.writeFileSync(reportPath, markdown, "utf-8");
    expect(fs.existsSync(reportPath)).toBe(true);
  });
});
