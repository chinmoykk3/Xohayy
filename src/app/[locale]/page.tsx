import { notFound } from "next/navigation";
import { HomeContent } from "@/components/home/HomeContent";
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
    <div className="space-y-4">
      {/* Accessible h1 landmark for screen readers */}
      <h1 className="sr-only">
        {t(validLocale, "home.title")} - {t(validLocale, "home.subtitle")}
      </h1>

      {/* Main Home Content: District Select, Risk Summary, Primary Actions & Live Dashboard */}
      <HomeContent locale={validLocale} />
    </div>
  );
}
