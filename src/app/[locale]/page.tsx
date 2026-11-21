import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
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
      {/* Emergency Header Banner */}
      <section aria-labelledby="emergency-heading">
        <Card className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-sm font-medium bg-[var(--color-risk-danger-bg)] text-[var(--color-risk-danger-text)] border border-[var(--color-risk-danger-border)]">
                <Icon name="alert-triangle" size={16} />
                <span>{t(validLocale, "home.emergencyPriority")}</span>
              </span>
              <h1
                id="emergency-heading"
                className="text-2xl sm:text-3xl font-bold mt-2 text-[var(--color-text-main)] tracking-tight"
              >
                {t(validLocale, "home.title")}
              </h1>
              <p className="text-base text-[var(--color-text-muted)] mt-1 max-w-xl">
                {t(validLocale, "home.subtitle")}
              </p>
            </div>
            <a
              href="tel:112"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] min-w-[56px] px-6 py-3 rounded-[var(--radius-card)] bg-[var(--color-emergency-bg)] text-[var(--color-emergency-text)] hover:bg-[var(--color-emergency-hover)] font-bold text-lg tracking-wide transition-colors"
              aria-label={`${t(validLocale, "home.call112")} - 112`}
            >
              <Icon name="phone" size={24} className="mr-2" />
              <span>{t(validLocale, "home.call112")}</span>
            </a>
          </div>
        </Card>
      </section>

      {/* Action Quick Access Grid */}
      <section
        aria-labelledby="actions-heading"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <h2 id="actions-heading" className="sr-only">
          {t(validLocale, "home.title")}
        </h2>

        <Card as="article">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)] border border-[var(--color-risk-warning-border)]">
              <Icon name="warning" size={22} />
            </span>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">
              {t(validLocale, "alerts.title")}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {t(validLocale, "alerts.subtitle")}
          </p>
          <Link href={`/${validLocale}/alerts`} className="w-full block">
            <Button variant="primary" className="w-full">
              {t(validLocale, "home.cta.alerts")}
            </Button>
          </Link>
        </Card>

        <Card as="article">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)] border border-[var(--color-risk-watch-border)]">
              <Icon name="shield" size={22} />
            </span>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">
              {t(validLocale, "guides.title")}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {t(validLocale, "guides.subtitle")}
          </p>
          <Link href={`/${validLocale}/guides`} className="w-full block">
            <Button variant="secondary" className="w-full">
              {t(validLocale, "home.cta.guides")}
            </Button>
          </Link>
        </Card>

        <Card as="article">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)] border border-[var(--color-risk-low-border)]">
              <Icon name="map-pin" size={22} />
            </span>
            <h3 className="text-lg font-bold text-[var(--color-text-main)]">
              {t(validLocale, "shelters.title")}
            </h3>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {t(validLocale, "shelters.subtitle")}
          </p>
          <Link href={`/${validLocale}/shelters`} className="w-full block">
            <Button variant="secondary" className="w-full">
              {t(validLocale, "home.cta.shelters")}
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
