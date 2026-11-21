import React from "react";
import { notFound } from "next/navigation";
import { GuideSteps } from "@/components/guides/GuideSteps";
import { LOCALES, isValidLocale, t } from "@/i18n/config";
import { getGuide } from "@/lib/data";
import type { Locale } from "@/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface GuidesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const floodGuide = getGuide("flood", validLocale);

  if (!floodGuide) {
    notFound();
  }

  return (
    <div className="space-y-4">
      {/* Accessible h1 landmark for screen readers & navigation */}
      <h1 className="sr-only">
        {t(validLocale, "guides.title")} - Flood &amp; Landslide Safety Guides
      </h1>

      {/* Main Full-Featured Guides Component Matching Design Reference */}
      <GuideSteps guide={floodGuide} locale={validLocale} />
    </div>
  );
}
