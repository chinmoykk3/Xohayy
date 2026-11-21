"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import {
  getCurrentLocation,
  buildEmergencyLocationMessage,
  buildWhatsAppLink,
  buildSmsLink,
  type Coordinates,
} from "@/lib/geo";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface ShareLocationProps {
  locale: Locale;
  className?: string;
}

export function ShareLocation({ locale, className = "" }: ShareLocationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [customDescription, setCustomDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRequestLocation = async () => {
    setIsLoading(true);
    setHasRequested(true);
    const location = await getCurrentLocation();
    setCoords(location);
    setIsLoading(false);
  };

  const message = buildEmergencyLocationMessage(coords, locale, customDescription);
  const whatsappUrl = buildWhatsAppLink(message);
  const smsUrl = buildSmsLink(message);

  const handleCopyMessage = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--color-border-card)] bg-[var(--color-bg-card)] p-4 space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-[var(--color-text-main)]">
        <Icon name="map-pin" size={22} className="text-[var(--color-primary-bg)]" />
        <h3 className="font-bold text-base sm:text-lg">{t(locale, "emergency.shareLocation")}</h3>
      </div>

      {!hasRequested ? (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            {t(locale, "emergency.subtitle")}
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={handleRequestLocation}
            className="w-full flex items-center justify-center gap-2"
          >
            <Icon name="map-pin" size={20} />
            <span>{t(locale, "emergency.shareLocation")}</span>
          </Button>
        </div>
      ) : isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-3 py-4 text-sm font-medium text-[var(--color-text-muted)]"
        >
          <span className="w-5 h-5 border-2 border-[var(--color-primary-bg)] border-t-transparent rounded-full animate-spin" />
          <span>{t(locale, "emergency.requestingLocation")}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Alert */}
          {coords ? (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-card)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low-text)] text-xs font-semibold"
            >
              <Icon name="check" size={16} />
              <span>
                {t(locale, "emergency.locationSuccess")} ({coords.lat.toFixed(4)},{" "}
                {coords.lng.toFixed(4)})
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                role="alert"
                className="flex items-start gap-2 px-3 py-2 rounded-[var(--radius-card)] bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)] text-xs font-medium"
              >
                <Icon name="warning" size={16} className="shrink-0 mt-0.5" />
                <span>{t(locale, "emergency.locationUnavailable")}</span>
              </div>
              <div>
                <label htmlFor="custom-location-input" className="sr-only">
                  {t(locale, "emergency.describeLocationPlaceholder")}
                </label>
                <input
                  id="custom-location-input"
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder={t(locale, "emergency.describeLocationPlaceholder")}
                  className="w-full min-h-[48px] px-3 py-2 text-sm rounded-[var(--radius-card)] border border-[var(--color-border-card)] bg-[var(--color-bg-page)] text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
                />
              </div>
            </div>
          )}

          {/* Message Preview Box */}
          <div className="p-3 rounded-[var(--radius-card)] bg-[var(--color-bg-page)] border border-[var(--color-border-card)] text-xs text-[var(--color-text-main)] break-words font-mono">
            {message}
          </div>

          {/* Share Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[48px] px-3 py-2 rounded-[var(--radius-card)] bg-[#25D366] text-white hover:bg-[#1EBE5D] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            >
              <Icon name="external-link" size={16} />
              <span>WhatsApp</span>
            </a>

            <a
              href={smsUrl}
              className="min-h-[48px] px-3 py-2 rounded-[var(--radius-card)] bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            >
              <Icon name="phone" size={16} />
              <span>SMS</span>
            </a>

            <Button
              type="button"
              variant="secondary"
              onClick={handleCopyMessage}
              className="text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Icon name="check" size={16} />
                  <span aria-live="polite">
                    {t(locale, "emergency.messageCopied").split(" ")[0]}
                  </span>
                </>
              ) : (
                <>
                  <Icon name="info" size={16} />
                  <span>{t(locale, "emergency.copyMessage")}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
