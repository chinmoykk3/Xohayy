"use client";

import React, { useMemo } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { CallButton } from "./CallButton";
import { ShareLocation } from "./ShareLocation";
import { getHelplines, getDistricts } from "@/lib/data";
import { usePreferences } from "@/hooks/usePreferences";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

export interface EmergencyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

export function EmergencyPanel({ isOpen, onClose, locale }: EmergencyPanelProps) {
  const { preferences } = usePreferences();

  const helplines = useMemo(() => getHelplines(), []);
  const districts = useMemo(() => getDistricts(), []);

  // Find 112 national emergency
  const national112 = useMemo(
    () =>
      helplines.find((h) => h.number === "112") || {
        id: "national-112",
        label: { en: "National Emergency", as: "ৰাষ্ট্ৰীয় জৰুৰীকালীন", hi: "राष्ट्रीय आपातकाल" },
        number: "112",
        available: "24x7",
      },
    [helplines]
  );

  // Core national services (ambulance, police, fire)
  const coreHelplines = useMemo(
    () => helplines.filter((h) => ["108", "100", "101", "1070"].includes(h.number)),
    [helplines]
  );

  // Selected district info
  const selectedDistrict = useMemo(
    () => districts.find((d) => d.id === preferences.districtId),
    [districts, preferences.districtId]
  );

  const districtControlRoomNumber = selectedDistrict?.controlRoom || "1077";
  const districtName = selectedDistrict?.name[locale] || "";

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t(locale, "emergency.title")}
      description={t(locale, "emergency.subtitle")}
    >
      <div className="space-y-4 py-1 max-h-[75vh] overflow-y-auto pr-1">
        {/* Offline Guarantee Notice */}
        <p className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-page)] border border-[var(--color-border-card)] p-2.5 rounded-[var(--radius-card)]">
          {t(locale, "emergency.offlineNotice")}
        </p>

        {/* 112 National Emergency - Largest Primary Call Button */}
        <div>
          <CallButton
            label={national112.label[locale] || national112.label.en}
            number={national112.number}
            subtext={`${national112.available} • National Police, Fire, Ambulance`}
            size="lg"
            variant="emergency"
            locale={locale}
          />
        </div>

        {/* Selected District Control Room */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            {selectedDistrict
              ? t(locale, "emergency.districtControlRoom", { district: districtName })
              : t(locale, "emergency.noDistrictSelected")}
          </h3>
          <CallButton
            label={
              selectedDistrict
                ? `${districtName} Control Room`
                : "District Emergency Operations (DEOC)"
            }
            number={districtControlRoomNumber}
            subtext="District Disaster Operations Centre • 24x7"
            variant="primary"
            locale={locale}
          />
        </div>

        {/* Core Emergency Services */}
        <div className="space-y-2 pt-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Essential Helplines
          </h3>
          <div className="space-y-2">
            {coreHelplines.map((helpline) => (
              <CallButton
                key={helpline.id}
                label={helpline.label[locale] || helpline.label.en}
                number={helpline.number}
                subtext={helpline.available}
                variant="secondary"
                locale={locale}
              />
            ))}
          </div>
        </div>

        <hr className="border-[var(--color-border-card)] my-4" />

        {/* Share Location Section */}
        <ShareLocation locale={locale} />
      </div>
    </Dialog>
  );
}
