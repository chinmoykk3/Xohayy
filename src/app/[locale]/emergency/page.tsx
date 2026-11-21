import Link from "next/link";
import { notFound } from "next/navigation";
import { CallButton } from "@/components/emergency/CallButton";
import { ShareLocation } from "@/components/emergency/ShareLocation";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { getHelplines, getDistricts } from "@/lib/data";
import { isValidLocale, t } from "@/i18n/config";
import type { Locale } from "@/types";

interface EmergencyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function EmergencyPage({ params }: EmergencyPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;
  const helplines = getHelplines();
  const districts = getDistricts();

  const national112 = helplines.find((h) => h.number === "112") || {
    id: "national-112",
    label: { en: "National Emergency", as: "ৰাষ্ট্ৰীয় জৰুৰীকালীন", hi: "राष्ट्रीय आपातकाल" },
    number: "112",
    available: "24x7",
  };

  const coreHelplines = helplines.filter((h) => ["108", "100", "101", "1070"].includes(h.number));

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <nav aria-label="Breadcrumb">
        <Link
          href={`/${validLocale}`}
          className="inline-flex items-center text-sm font-medium text-[var(--color-primary-bg)] hover:underline min-h-[48px] py-2"
        >
          <Icon name="check" size={16} className="rotate-180 mr-1.5" />
          <span>{t(validLocale, "common.back")}</span>
        </Link>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-text-main)]">
          {t(validLocale, "emergency.title")}
        </h1>
        <p className="text-base text-[var(--color-text-muted)] mt-1">
          {t(validLocale, "emergency.subtitle")}
        </p>
      </div>

      {/* Offline Notice */}
      <Card className="bg-[var(--color-bg-page)] border-[var(--color-border-card)] p-3 text-xs sm:text-sm text-[var(--color-text-muted)] flex items-center gap-2">
        <Icon name="shield" size={18} className="shrink-0 text-[var(--color-primary-bg)]" />
        <span>{t(validLocale, "emergency.offlineNotice")}</span>
      </Card>

      {/* Primary Emergency 112 */}
      <section aria-labelledby="national-112-heading" className="space-y-2">
        <h2 id="national-112-heading" className="sr-only">
          {national112.label[validLocale] || national112.label.en}
        </h2>
        <CallButton
          label={national112.label[validLocale] || national112.label.en}
          number={national112.number}
          subtext="National Police, Fire, Ambulance • Toll-Free 24x7"
          size="lg"
          variant="emergency"
          locale={validLocale}
        />
      </section>

      {/* Core Helplines List */}
      <section aria-labelledby="core-helplines-heading" className="space-y-3">
        <h2 id="core-helplines-heading" className="text-lg font-bold text-[var(--color-text-main)]">
          Core Disaster & Emergency Helplines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {coreHelplines.map((helpline) => (
            <CallButton
              key={helpline.id}
              label={helpline.label[validLocale] || helpline.label.en}
              number={helpline.number}
              subtext={helpline.available}
              variant="secondary"
              locale={validLocale}
            />
          ))}
        </div>
      </section>

      {/* District Operations Centre Directory */}
      <section aria-labelledby="deoc-directory-heading" className="space-y-3">
        <h2 id="deoc-directory-heading" className="text-lg font-bold text-[var(--color-text-main)]">
          District Emergency Operations Centres (DEOC)
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          Local district disaster control rooms across Assam and the North East:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {districts.map((district) => (
            <CallButton
              key={district.id}
              label={`${district.name[validLocale] || district.name.en} Control Room`}
              number={district.controlRoom}
              subtext={`${district.state} • 24x7 DEOC`}
              variant="secondary"
              locale={validLocale}
            />
          ))}
        </div>
      </section>

      {/* Share Location Section */}
      <section aria-labelledby="share-location-heading" className="space-y-3 pt-2">
        <h2 id="share-location-heading" className="sr-only">
          {t(validLocale, "emergency.shareLocation")}
        </h2>
        <ShareLocation locale={validLocale} />
      </section>
    </div>
  );
}
