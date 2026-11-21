import { Inter, Noto_Sans_Bengali, Noto_Sans_Devanagari } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-latin",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
});

export const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: "swap",
  variable: "--font-bengali",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

export const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  display: "swap",
  variable: "--font-devanagari",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});
