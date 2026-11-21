import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
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
  const landslideGuide = getGuide("landslide", validLocale);

  const guideCards = [
    {
      hazard: "flood",
      title: floodGuide?.title || t(validLocale, "guides.hazard.flood"),
      description: t(validLocale, "guides.subtitle"),
      icon: "droplets" as const,
      stepCount: floodGuide?.steps.length || 0,
      href: `/${validLocale}/guides/flood`,
    },
    {
      hazard: "landslide",
      title: landslideGuide?.title || t(validLocale, "guides.hazard.landslide"),
      description: t(validLocale, "guides.subtitle"),
      icon: "warning" as const,
      stepCount: landslideGuide?.steps.length || 0,
      href: `/${validLocale}/guides/landslide`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          tabIndex={-1}
          className="text-2xl sm:text-3xl font-bold text-[var(--color-text-main)] tracking-tight focus:outline-none"
        >
          {t(validLocale, "guides.title")}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] mt-1 max-w-xl">
          {t(validLocale, "guides.subtitle")}
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {guideCards.map((card) => (
          <Link
            key={card.hazard}
            href={card.href}
            className="block focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] rounded-[var(--radius-card)]"
          >
            <Card
              as="article"
              className="h-full bg-[var(--color-bg-card)] border border-[var(--color-border-card)] hover:border-[var(--color-primary-bg)] transition-colors p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-[var(--radius-card)] bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)] border border-[var(--color-risk-watch-border)]">
                    <Icon name={card.icon} size={24} />
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)]">
                    {card.title}
                  </h2>
                </div>

                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-card)] mt-4 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>{card.stepCount} actionable steps</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-main)]">
                  <span>View guide</span>
                  <Icon name="arrow-right" size={14} />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
