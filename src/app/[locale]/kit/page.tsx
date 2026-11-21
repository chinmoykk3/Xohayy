import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LOCALES, isValidLocale, t } from "@/i18n/config";
import type { Locale } from "@/types";
import { KitChecklist } from "@/components/guides/KitChecklist";

interface KitPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: KitPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  return {
    title: `${t(locale, "kit.title")} | Xahay`,
    description: t(locale, "kit.subtitle"),
  };
}

export default async function KitPage({ params }: KitPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  return (
    <div className="space-y-6">
      <KitChecklist locale={validLocale} />
    </div>
  );
}
