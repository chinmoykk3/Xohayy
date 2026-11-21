import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface HomeActionsProps {
  locale: Locale;
}

export function HomeActions({ locale }: HomeActionsProps) {
  return (
    <section aria-labelledby="primary-actions-heading">
      <h2 id="primary-actions-heading" className="sr-only">
        {t(locale, "home.actionsHeading")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Action 1: Emergency Numbers */}
        <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-danger-bg)] text-[var(--color-risk-danger-text)]">
                <Icon name="phone" size={20} />
              </span>
              <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                {t(locale, "home.cta.emergency")}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t(locale, "home.cta.emergencyDesc")}
            </p>
          </div>
          <div className="pt-4">
            <Link href={`/${locale}/emergency`} className="block w-full">
              <Button variant="emergency" className="w-full">
                {t(locale, "home.cta.callEmergency")}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Action 2: Safety Guides */}
        <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)]">
                <Icon name="file-text" size={20} />
              </span>
              <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                {t(locale, "home.cta.guides")}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t(locale, "home.cta.guidesDesc")}
            </p>
          </div>
          <div className="pt-4">
            <Link href={`/${locale}/guides`} className="block w-full">
              <Button variant="primary" className="w-full">
                {t(locale, "home.cta.viewGuides")}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Action 3: Shelters Nearby */}
        <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)]">
                <Icon name="map-pin" size={20} />
              </span>
              <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                {t(locale, "home.cta.shelters")}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t(locale, "home.cta.sheltersDesc")}
            </p>
          </div>
          <div className="pt-4">
            <Link href={`/${locale}/shelters`} className="block w-full">
              <Button variant="secondary" className="w-full">
                {t(locale, "home.cta.findShelters")}
              </Button>
            </Link>
          </div>
        </Card>

        {/* Action 4: Report a Problem */}
        <Card className="flex flex-col justify-between hover:border-[var(--color-border-card-hover)] transition-colors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)]">
                <Icon name="alert-triangle" size={20} />
              </span>
              <h3 className="font-semibold text-base text-[var(--color-text-main)]">
                {t(locale, "home.cta.reports")}
              </h3>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              {t(locale, "home.cta.reportsDesc")}
            </p>
          </div>
          <div className="pt-4">
            <Link href={`/${locale}/report`} className="block w-full">
              <Button variant="secondary" className="w-full">
                {t(locale, "home.cta.submitReport")}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
