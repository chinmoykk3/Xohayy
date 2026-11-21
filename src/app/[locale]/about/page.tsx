import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LOCALES, isValidLocale, t } from "@/i18n/config";
import type { Locale } from "@/types";
import { Icon } from "@/components/ui/Icon";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};

  return {
    title: `${t(locale, "about.title")} | Xahay`,
    description: t(locale, "home.subtitle"),
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  const validLocale = locale as Locale;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="max-w-[960px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 outline-none"
    >
      {/* Page Title */}
      <div className="border-b border-[var(--color-border-card)] pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-main)]">
          {t(validLocale, "about.title")}
        </h1>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] mt-1">
          {t(validLocale, "home.subtitle")}
        </p>
      </div>

      {/* Critical 112 Primary Emergency Notice */}
      <section
        role="alert"
        aria-label="Official Emergency Primary Channel"
        className="p-4 sm:p-5 rounded-[var(--radius-card)] bg-red-50 border-2 border-red-500 text-red-950 space-y-2"
      >
        <div className="flex items-center gap-2">
          <Icon name="alert-triangle" size={24} className="text-red-700 shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-red-900">
            {t(validLocale, "about.emergencyNotice")}
          </h2>
        </div>
        <p className="text-sm text-red-900 leading-relaxed">
          Xahay is a community-accessible, lightweight hazard dashboard designed to complement
          official channels during communication blackouts. In any immediate life-threatening
          emergency, <strong>always call 112 directly</strong>.
        </p>
        <div className="pt-1">
          <a
            href="tel:112"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            <Icon name="phone" size={16} />
            <span>Call 112 (All-India Emergency)</span>
          </a>
        </div>
      </section>

      {/* What the App is */}
      <section id="mission" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Icon name="shield" size={20} className="text-[var(--color-primary-bg)]" />
          <span>What is Xahay?</span>
        </h2>
        <div className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed space-y-2">
          <p>
            Xahay (সহায় - &quot;Support / Relief&quot;) is a low-bandwidth, offline-first disaster
            response and hazard coordination dashboard engineered specifically for Assam and the
            North-Eastern river basin states.
          </p>
          <p>
            Designed to function resiliently across 2G networks, intermittent cellular connectivity,
            and complete power outages, Xahay caches essential emergency data locally in your
            browser so you retain full access to helpline numbers, safety guides, and emergency
            checklists regardless of network status.
          </p>
        </div>
      </section>

      {/* Official Data Sources */}
      <section id="sources" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Icon name="file-text" size={20} className="text-[var(--color-primary-bg)]" />
          <span>{t(validLocale, "about.sources")}</span>
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          {t(validLocale, "about.sourcesList")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
            <h3 className="font-semibold text-sm text-[var(--color-text-main)]">
              ASDMA (Assam State Disaster Management Authority)
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Official state flood bulletins, district emergency directives, and evacuation notices.
            </p>
          </div>
          <div className="p-3.5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
            <h3 className="font-semibold text-sm text-[var(--color-text-main)]">
              CWC (Central Water Commission)
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Brahmaputra and Barak river basin hydrologic telemetry, danger level warnings, and
              flood crest trends.
            </p>
          </div>
          <div className="p-3.5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
            <h3 className="font-semibold text-sm text-[var(--color-text-main)]">
              IMD (India Meteorological Department)
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Regional meteorological forecasts, Doppler precipitation alerts, and severe weather
              warnings.
            </p>
          </div>
          <div className="p-3.5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)]">
            <h3 className="font-semibold text-sm text-[var(--color-text-main)]">
              NDRF & SDRF First Responders
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Operational relief camp coordinates, field status verification, and rescue deployment
              data.
            </p>
          </div>
        </div>
      </section>

      {/* Moderation Policy */}
      <section id="moderation" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Icon name="check" size={20} className="text-[var(--color-primary-bg)]" />
          <span>{t(validLocale, "about.moderation")}</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
          {t(validLocale, "about.moderationDetails")}
        </p>
        <ul className="list-disc list-inside text-xs sm:text-sm text-[var(--color-text-muted)] space-y-1 pl-1">
          <li>Every community report is held in a moderation queue before public display.</li>
          <li>
            Automated honeypot and client-side cryptographic rate limits filter spam and bots.
          </li>
          <li>
            All personally identifiable information (phone numbers, full names) is stripped before
            publication.
          </li>
          <li>Unverified, misleading, or panic-inducing reports are rejected immediately.</li>
        </ul>
      </section>

      {/* Plain Language Privacy Statement in 3 Languages */}
      <section id="privacy" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Icon name="shield" size={20} className="text-[var(--color-primary-bg)]" />
          <span>{t(validLocale, "about.privacy")}</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] font-medium">
          {t(validLocale, "about.privacyStatement")}
        </p>

        {/* Trilingual Privacy Tabs/Cards */}
        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)] space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-bg)]">
              English (EN)
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-main)] leading-relaxed">
              We collect no accounts, names, emails, or phone numbers. Your district selection,
              high-contrast settings, and emergency kit checklist are stored exclusively inside your
              browser&apos;s localStorage and never transmitted to our servers. Your GPS location is
              accessed only when you explicitly press &quot;Share Location&quot; to formulate an SOS
              message on your phone. No tracking scripts or analytics cookies exist on this
              platform.
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)] space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-bg)]">
              অসমীয়া (AS)
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-main)] leading-relaxed">
              আমি কোনো একাউণ্ট, নাম, ইমেইল বা ফোন নম্বৰ সংগ্ৰহ নকৰোঁ। আপোনাৰ জিলাৰ নিৰ্বাচন, ৰং সংহতি আৰু
              জৰুৰীকালীন সামগ্ৰীৰ তালিকা কেৱল আপোনাৰ ব্ৰাউজাৰৰ স্থানীয় স্মৃতিত সংৰক্ষিত থাকে। আপোনাৰ জিপিএছ
              স্থান কেৱল তেতিয়াহে ব্যৱহাৰ হয় যেতিয়া আপুনি নিজেই &quot;স্থান ভাগ-বতৰা&quot; টিপিব। ইয়াত
              কোনো বিজ্ঞাপন বা ট্ৰেকিং সঁজুলি নাই।
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)] space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-bg)]">
              हिन्दी (HI)
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-main)] leading-relaxed">
              हम कोई खाता, नाम, ईमेल या फ़ोन नंबर एकत्र नहीं करते हैं। आपका जिला चयन, कंट्रास्ट प्राथमिकताएँ और
              आपातकालीन किट चेकलिस्ट केवल आपके ब्राउज़र के लोकल स्टोरेज में सहेजी जाती हैं और हमारे सर्वर पर कभी नहीं
              भेजी जाती हैं। आपका स्थान केवल तभी एक्सेस किया जाता है जब आप स्वयं &quot;स्थान साझा करें&quot; चुनते
              हैं। इस प्लेटफॉर्म पर कोई ट्रैकिंग या विज्ञापन उपकरण नहीं है।
            </p>
          </div>
        </div>
      </section>

      {/* Accessibility Statement Placeholder (Phase 21) */}
      <section id="accessibility" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Icon name="info" size={20} className="text-[var(--color-primary-bg)]" />
          <span>Accessibility Statement</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
          {t(validLocale, "about.accessibilityDetails")}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Xahay conforms to WCAG 2.2 Level AA accessibility guidelines, offering minimum 48px touch
          targets, full keyboard navigability, high contrast toggles (4.5:1 / 7:1 contrast ratios),
          text scaling up to 150%, and screen reader semantic markers.
        </p>
      </section>

      {/* Contact & Helplines Placeholder */}
      <section id="contact" className="space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-main)] flex items-center gap-2">
          <Icon name="phone" size={20} className="text-[var(--color-primary-bg)]" />
          <span>{t(validLocale, "about.contact")}</span>
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-text-muted)]">
          {t(validLocale, "about.contactDetails")}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="tel:1070"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border-card)] text-sm font-semibold text-[var(--color-text-main)] hover:border-gray-400"
          >
            <Icon name="phone" size={16} />
            <span>State Disaster EOC: 1070</span>
          </a>
          <a
            href="tel:1077"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[var(--color-bg-card)] border border-[var(--color-border-card)] text-sm font-semibold text-[var(--color-text-main)] hover:border-gray-400"
          >
            <Icon name="phone" size={16} />
            <span>District Disaster DEOC: 1077</span>
          </a>
        </div>
      </section>

      {/* Licence */}
      <section id="license" className="border-t border-[var(--color-border-card)] pt-6 space-y-2">
        <h2 className="text-base font-bold text-[var(--color-text-main)]">Open Source Licence</h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
          Xahay is open-source software distributed under the MIT Licence. Built for public good and
          civic disaster coordination across Assam and the North-East.
        </p>
        <div className="pt-2">
          <Link
            href={`/${validLocale}/kit`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary-bg)] hover:underline"
          >
            <span>&larr; View Emergency Kit Checklist</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
