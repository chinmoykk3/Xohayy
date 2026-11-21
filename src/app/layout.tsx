import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Xahay | Emergency Assistant for North East India",
  description:
    "Offline-first community emergency assistant for floods and landslides in North East India.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-contrast="normal" data-text-scale="1">
      <body className="min-h-screen flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-main)] antialiased">
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
