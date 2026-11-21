import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideSteps } from "@/components/guides/GuideSteps";
import { LOCALES, isValidLocale, t } from "@/i18n/config";
import { getGuide } from "@/lib/data";
import type { Locale } from "@/types";

const VALID_HAZARDS = ["flood", "landslide"] as const;
type ValidHazard = (typeof VALID_HAZARDS)[number];

export function generateStaticParams() {
  const params: { locale: string; hazard: string }[] = [];
  for (const locale of LOCALES) {
    for (const hazard of VALID_HAZARDS) {
      params.push({ locale, hazard });
    }
  }
  return params;
}

interface GuideDetailPageProps {
  params: Promise<{ locale: string; hazard: string }>;
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { locale, hazard } = await params;

  if (!isValidLocale(locale) || !VALID_HAZARDS.includes(hazard as ValidHazard)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const guide = getGuide(hazard as ValidHazard, validLocale);

  if (!guide) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back to Guides Navigation Link */}
      <div>
        <Link
          href={`/${validLocale}/guides`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] min-h-[44px] px-1 py-1 rounded-[var(--radius-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
        >
          <span aria-hidden="true">&larr;</span>
          <span>{t(validLocale, "guides.title")}</span>
        </Link>
      </div>

      {/* Guide Header */}
      <div>
        <h1
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] tracking-tight focus:outline-none"
        >
          {guide.title}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] mt-1">
          {t(validLocale, "guides.subtitle")}
        </p>
      </div>

      {/* Step by Step Action Checklist & Read Aloud */}
      <GuideSteps guide={guide} locale={validLocale} />
    </div>
  );
}
