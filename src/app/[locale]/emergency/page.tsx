import { notFound } from "next/navigation";
import { EmergencyView } from "@/components/emergency/EmergencyView";
import { isValidLocale, t } from "@/i18n/config";
import type { Locale } from "@/types";

interface EmergencyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: EmergencyPageProps) {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  return {
    title: `${t(locale, "emergency.title")} | Xahay`,
    description: t(locale, "emergency.subtitle"),
  };
}

export default async function EmergencyPage({ params }: EmergencyPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  return (
    <div>
      <EmergencyView locale={validLocale} />
    </div>
  );
}
