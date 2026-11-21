import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AlertsView } from "@/components/alerts/AlertsView";
import { isValidLocale } from "@/i18n/config";
import type { Locale } from "@/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AlertsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  return (
    <Suspense
      fallback={<div className="p-8 text-center text-sm text-gray-500">Loading alerts...</div>}
    >
      <AlertsView locale={validLocale} />
    </Suspense>
  );
}
