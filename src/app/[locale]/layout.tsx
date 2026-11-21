import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RouteFocus } from "@/components/layout/RouteFocus";
import { EmergencyFab } from "@/components/layout/EmergencyFab";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import { PreferencesProvider } from "@/context/PreferencesContext";
import { inter, notoSansBengali, notoSansDevanagari } from "@/app/fonts";
import { LOCALES, HTML_LANG_MAP, isValidLocale } from "@/i18n/config";
import type { Locale } from "@/types";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0369a1",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Xahay | Emergency Assistant for North East India",
  description:
    "Offline-first community emergency assistant for floods and landslides in North East India.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Xahay",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const htmlLang = HTML_LANG_MAP[validLocale] || "en";

  return (
    <html
      lang={htmlLang}
      data-contrast="normal"
      data-text-scale="1"
      className={`${inter.variable} ${notoSansBengali.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--color-bg-page)] text-[var(--color-text-main)] antialiased font-sans">
        <PreferencesProvider initialLocale={validLocale}>
          <ServiceWorkerRegister locale={validLocale} />
          <RouteFocus />
          <SkipLink />
          <OfflineBanner locale={validLocale} />
          <EmergencyFab locale={validLocale} />
          <Header locale={validLocale} />
          <main id="main-content" className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <Footer locale={validLocale} />
        </PreferencesProvider>
      </body>
    </html>
  );
}
