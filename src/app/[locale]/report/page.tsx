import React from "react";
import { notFound } from "next/navigation";
import { ReportForm } from "@/components/report/ReportForm";
import { LOCALES, isValidLocale, t } from "@/i18n/config";
import type { Locale } from "@/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

interface ReportPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] tracking-tight focus:outline-none"
        >
          {t(validLocale, "report.title")}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] mt-1 max-w-xl">
          {t(validLocale, "report.subtitle")}
        </p>
      </div>

      {/* Main Report Form */}
      <ReportForm locale={validLocale} />
    </div>
  );
}
