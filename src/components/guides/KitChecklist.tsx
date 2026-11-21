"use client";

import React, { useState } from "react";
import { usePreferences } from "@/hooks/usePreferences";
import { getKitItems } from "@/lib/data";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface KitChecklistProps {
  locale: Locale;
  className?: string;
}

export function KitChecklist({ locale, className = "" }: KitChecklistProps) {
  const { preferences, toggleKitItem, resetKitItems } = usePreferences();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const kitItems = getKitItems();
  const totalCount = kitItems.length;
  const checkedSet = new Set(preferences.kitChecked);
  const checkedCount = kitItems.filter((item) => checkedSet.has(item.id)).length;
  const percentage = Math.round((checkedCount / totalCount) * 100);
  const allPacked = checkedCount === totalCount && totalCount > 0;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleConfirmReset = () => {
    resetKitItems();
    setIsResetDialogOpen(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Print/Reset Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-card)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)]">
            {t(locale, "kit.title")}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{t(locale, "kit.subtitle")}</p>
        </div>

        <div className="flex items-center gap-2 print-hide">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrint}
            className="flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm"
            aria-label={t(locale, "kit.print")}
          >
            <Icon name="external-link" size={16} />
            <span>{t(locale, "kit.print")}</span>
          </Button>

          <Button
            type="button"
            variant="emergency"
            onClick={() => setIsResetDialogOpen(true)}
            className="flex items-center gap-1.5 min-h-[44px] text-xs sm:text-sm"
            aria-label={t(locale, "kit.reset")}
            disabled={checkedCount === 0}
          >
            <span>{t(locale, "kit.reset")}</span>
          </Button>
        </div>
      </div>

      {/* Progress Section */}
      <div
        className="p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)] space-y-3 print-card"
        role="region"
        aria-label="Checklist completion progress"
      >
        <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[var(--color-text-main)]">
          <span>
            {t(locale, "kit.progress", {
              checked: String(checkedCount),
              total: String(totalCount),
            })}
          </span>
          <span className="text-[var(--color-primary-bg)]">{percentage}%</span>
        </div>

        {/* Accessible Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={checkedCount}
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-label={t(locale, "kit.progress", {
            checked: String(checkedCount),
            total: String(totalCount),
          })}
          className="w-full h-3.5 bg-gray-200 rounded-full overflow-hidden"
        >
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              allPacked ? "bg-emerald-600" : "bg-[var(--color-primary-bg)]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {allPacked && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold"
          >
            <Icon name="check" size={16} className="text-emerald-600 shrink-0" />
            <span>{t(locale, "kit.allPacked")}</span>
          </div>
        )}
      </div>

      {/* Checklist Items List */}
      <ul
        role="list"
        aria-label={t(locale, "kit.title")}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {kitItems.map((item) => {
          const isChecked = checkedSet.has(item.id);
          const itemName = item.name[locale] || item.name.en;
          const itemDesc = item.description?.[locale] || item.description?.en;

          return (
            <li
              key={item.id}
              className={`p-3.5 rounded-[var(--radius-card)] border transition-colors flex items-start gap-3.5 print-card ${
                isChecked
                  ? "bg-emerald-50/40 border-emerald-300 dark:bg-emerald-950/20"
                  : "bg-[var(--color-bg-card)] border-[var(--color-border-card)] hover:border-gray-400"
              }`}
            >
              <input
                type="checkbox"
                id={`kit-item-${item.id}`}
                checked={isChecked}
                onChange={() => toggleKitItem(item.id)}
                className="w-5 h-5 mt-0.5 rounded text-[var(--color-primary-bg)] focus:ring-[var(--color-focus-ring)] cursor-pointer shrink-0"
                aria-describedby={itemDesc ? `kit-desc-${item.id}` : undefined}
              />
              <label
                htmlFor={`kit-item-${item.id}`}
                className="flex-1 cursor-pointer select-none text-left"
              >
                <div
                  className={`text-sm sm:text-base font-semibold leading-snug ${
                    isChecked
                      ? "text-emerald-900 line-through decoration-emerald-600/60"
                      : "text-[var(--color-text-main)]"
                  }`}
                >
                  {itemName}
                </div>
                {itemDesc && (
                  <p
                    id={`kit-desc-${item.id}`}
                    className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed"
                  >
                    {itemDesc}
                  </p>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      {/* Confirmation Dialog for Resetting Checklist */}
      <Dialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        title={t(locale, "kit.resetConfirmTitle")}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            {t(locale, "kit.resetConfirmMessage")}
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsResetDialogOpen(false)}>
              {t(locale, "kit.resetCancelBtn")}
            </Button>
            <Button type="button" variant="emergency" onClick={handleConfirmReset}>
              {t(locale, "kit.resetConfirmBtn")}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
