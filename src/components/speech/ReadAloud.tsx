"use client";

import React from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

export interface ReadAloudProps {
  text: string;
  locale: Locale;
  className?: string;
  compact?: boolean;
}

export function ReadAloud({ text, locale, className = "", compact = false }: ReadAloudProps) {
  const { status, isSupported, isFallback, voice, rate, setRate, speak, pause, resume, stop } =
    useSpeech({ locale });

  const isPlaying = status === "playing";
  const isPaused = status === "paused";
  const isIdle = status === "idle";

  const getStatusAnnouncement = () => {
    if (isPlaying) return t(locale, "guides.readAloud.statePlaying");
    if (isPaused) return t(locale, "guides.readAloud.statePaused");
    return t(locale, "guides.readAloud.stateStopped");
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(text);
    }
  };

  return (
    <div
      className={`rounded-[var(--radius-card)] bg-[var(--color-bg-page)] border border-[var(--color-border-card)] p-3 text-sm space-y-2 ${className}`}
      role="region"
      aria-label={t(locale, "guides.readAloud.play")}
    >
      {/* Fallback Notice for Assamese */}
      {isFallback && (
        <div
          role="status"
          className="flex items-start gap-2 p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-warning-bg)] text-[var(--color-risk-warning-text)] border border-[var(--color-risk-warning-border)] text-xs font-medium"
        >
          <Icon name="warning" size={16} className="shrink-0 mt-0.5" />
          <span>{t(locale, "guides.readAloud.fallbackNotice")}</span>
        </div>
      )}

      {/* Unsupported or Missing Voice Notice */}
      {(!isSupported || (!voice && status !== "playing")) && (
        <div
          role="alert"
          className="flex items-start gap-2 p-2 rounded-[var(--radius-card)] bg-[var(--color-risk-watch-bg)] text-[var(--color-risk-watch-text)] border border-[var(--color-risk-watch-border)] text-xs font-medium"
        >
          <Icon name="volume-x" size={16} className="shrink-0 mt-0.5" />
          <span>{t(locale, "guides.readAloud.noVoice", { language: locale.toUpperCase() })}</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Play / Pause Button */}
          <button
            type="button"
            onClick={handlePlayPause}
            disabled={!isSupported}
            aria-label={
              isPlaying ? t(locale, "guides.readAloud.pause") : t(locale, "guides.readAloud.play")
            }
            className="inline-flex items-center justify-center min-h-[44px] px-3.5 py-1.5 rounded-[var(--radius-card)] bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] hover:opacity-90 font-medium text-xs sm:text-sm transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed gap-1.5 shadow-xs"
          >
            <Icon name={isPlaying ? "pause" : "play"} size={16} />
            <span>
              {isPlaying ? t(locale, "guides.readAloud.pause") : t(locale, "guides.readAloud.play")}
            </span>
          </button>

          {/* Stop Button */}
          <button
            type="button"
            onClick={stop}
            disabled={!isSupported || isIdle}
            aria-label={t(locale, "guides.readAloud.stop")}
            className="inline-flex items-center justify-center min-h-[44px] px-3 py-1.5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-card)] hover:bg-[var(--color-border-card)] font-medium text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed gap-1"
          >
            <Icon name="square" size={14} />
            <span>{t(locale, "guides.readAloud.stop")}</span>
          </button>
        </div>

        {/* Speed Selector */}
        {!compact && (
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <span className="font-medium mr-1">{t(locale, "guides.readAloud.speed")}:</span>
            <button
              type="button"
              onClick={() => setRate(1.0)}
              aria-pressed={rate === 1.0}
              className={`min-h-[36px] px-2 py-1 rounded-[var(--radius-card)] text-xs font-semibold cursor-pointer border ${
                rate === 1.0
                  ? "bg-[var(--color-text-main)] text-[var(--color-bg-page)] border-[var(--color-text-main)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)]"
              }`}
            >
              {t(locale, "guides.readAloud.normalSpeed")}
            </button>
            <button
              type="button"
              onClick={() => setRate(0.8)}
              aria-pressed={rate === 0.8}
              className={`min-h-[36px] px-2 py-1 rounded-[var(--radius-card)] text-xs font-semibold cursor-pointer border ${
                rate === 0.8
                  ? "bg-[var(--color-text-main)] text-[var(--color-bg-page)] border-[var(--color-text-main)]"
                  : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border-[var(--color-border-card)]"
              }`}
            >
              {t(locale, "guides.readAloud.slowSpeed")}
            </button>
          </div>
        )}
      </div>

      {/* Screen reader live announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        {getStatusAnnouncement()}
      </div>
    </div>
  );
}

export default ReadAloud;
