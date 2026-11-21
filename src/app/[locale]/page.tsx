import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
import { HomeActions } from "@/components/home/HomeActions";
import { isValidLocale, t } from "@/i18n/config";
import type { Locale } from "@/types";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  return (
    <div className="space-y-6">
      {/* Accessible h1 landmark for screen readers */}
      <h1 className="sr-only">
        {t(validLocale, "home.title")} - {t(validLocale, "home.subtitle")}
      </h1>

      {/* Interactive parts: District Select, Risk Summary & Live Community Reports */}
      <HomeContent locale={validLocale} />

      {/* Server-rendered static Primary Actions */}
      <HomeActions locale={validLocale} />
    </div>
  );
}
