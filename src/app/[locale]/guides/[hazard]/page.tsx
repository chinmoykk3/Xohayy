import React from "react";
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
    <div className="space-y-4">
      {/* Accessible h1 landmark for screen readers */}
      <h1 className="sr-only">
        {guide.title} - {t(validLocale, "guides.subtitle")}
      </h1>

      {/* Interactive Safety Guide Steps */}
      <GuideSteps guide={guide} locale={validLocale} />
    </div>
  );
}
