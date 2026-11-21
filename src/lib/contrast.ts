/**
 * Accessibility contrast calculation utility adhering to WCAG 2.2 specifications.
 */

function parseHex(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "").trim();
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16);
    const g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16);
    const b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Invalid hex color: ${hex}`);
}

function getChannelLuminance(value: number): number {
  const srgb = value / 255;
  if (srgb <= 0.03928) {
    return srgb / 12.92;
  }
  return Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Calculates relative luminance according to WCAG 2.2 formula.
 */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (
    0.2126 * getChannelLuminance(r) +
    0.7152 * getChannelLuminance(g) +
    0.0722 * getChannelLuminance(b)
  );
}

/**
 * Calculates contrast ratio between two hex colors.
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}

export interface ContrastResult {
  name: string;
  foreground: string;
  background: string;
  ratio: number;
  requiredRatio: number;
  pass: boolean;
}

export function checkContrast(
  name: string,
  foreground: string,
  background: string,
  requiredRatio = 4.5
): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);
  return {
    name,
    foreground,
    background,
    ratio,
    requiredRatio,
    pass: ratio >= requiredRatio,
  };
}
