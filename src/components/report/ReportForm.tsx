"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getDistricts } from "@/lib/data";
import { useDistrict } from "@/hooks/useDistrict";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { createReportSchema } from "@/lib/validators";
import { enqueueReport, setupQueueAutoSync } from "@/lib/offlineQueue";
import { getReportTypeIcon, getReportTypeLabel } from "@/lib/reports";
import { t } from "@/i18n/config";
import type { ReportType, Locale } from "@/types";

export interface ReportFormProps {
  locale: Locale;
  className?: string;
  onSuccess?: () => void;
}

const REPORT_TYPES: ReportType[] = [
  "road_blocked",
  "area_flooded",
  "landslide",
  "bridge_damaged",
  "need_help",
  "safe_shelter",
];

interface FormErrors {
  type?: string;
  districtId?: string;
  note?: string;
  place?: string;
  general?: string;
}

type SubmissionState = "idle" | "submitting" | "success" | "queued" | "rate_limited" | "error";

export function ReportForm({ locale, className = "", onSuccess }: ReportFormProps) {
  const isOnline = useOnlineStatus();
  const { districtId: preferredDistrictId } = useDistrict();
  const districts = useMemo(() => getDistricts(), []);

  // Form fields
  const [selectedType, setSelectedType] = useState<ReportType | "">("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const districtId = selectedDistrictId || preferredDistrictId || "";
  const [place, setPlace] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");

  // Status and error states
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [queuedDroppedOldest, setQueuedDroppedOldest] = useState(false);

  // Debounced character count for polite screen reader announcement
  const [debouncedCount, setDebouncedCount] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Setup auto-sync for offline queue when browser reconnects
  useEffect(() => {
    const cleanup = setupQueueAutoSync();
    return cleanup;
  }, []);

  // Debounce counter announcement: announce only after 1000ms pause in typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCount(note.length);
    }, 1000);
    return () => clearTimeout(timer);
  }, [note.length]);

  // Validate form client-side with createReportSchema
  const validateForm = (): boolean => {
    const fieldErrors: FormErrors = {};

    if (!selectedType) {
      fieldErrors.type = "Please select a condition type from the options above.";
    }

    if (!districtId) {
      fieldErrors.districtId = "Please choose the affected district.";
    }

    const parseResult = createReportSchema.safeParse({
      type: selectedType || undefined,
      districtId: districtId || undefined,
      note,
      place: place.trim() || undefined,
      honeypot,
    });

    if (!parseResult.success) {
      const flattened = parseResult.error.flatten().fieldErrors;
      if (flattened.note?.[0]) {
        fieldErrors.note = "Please describe the situation (between 1 and 200 characters).";
      }
      if (flattened.place?.[0]) {
        fieldErrors.place = "Location name cannot exceed 80 characters.";
      }
      if (flattened.districtId?.[0] && !fieldErrors.districtId) {
        fieldErrors.districtId = "Please choose the affected district.";
      }
      if (flattened.type?.[0] && !fieldErrors.type) {
        fieldErrors.type = "Please select a valid report condition type.";
      }
    }

    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      // Focus error summary for accessibility
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 50);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmissionState("submitting");

    const payload = {
      districtId,
      type: selectedType as ReportType,
      note: note.trim(),
      place: place.trim() || undefined,
      honeypot,
    };

    // If device is offline, enqueue directly to IndexedDB
    if (!isOnline) {
      try {
        const queueResult = await enqueueReport(payload);
        setQueuedDroppedOldest(queueResult.droppedOldest);
        setSubmissionState("queued");
        resetFormFields();
        onSuccess?.();
        return;
      } catch {
        setSubmissionState("error");
        return;
      }
    }

    // Online submission to /api/reports
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        setSubmissionState("rate_limited");
        return;
      }

      if (!response.ok) {
        // Fall back to queueing if network failed during fetch
        try {
          const queueResult = await enqueueReport(payload);
          setQueuedDroppedOldest(queueResult.droppedOldest);
          setSubmissionState("queued");
          resetFormFields();
          onSuccess?.();
          return;
        } catch {
          setSubmissionState("error");
          return;
        }
      }

      setSubmissionState("success");
      resetFormFields();
      onSuccess?.();
    } catch {
      // Network disconnect during submission -> queue locally
      try {
        const queueResult = await enqueueReport(payload);
        setQueuedDroppedOldest(queueResult.droppedOldest);
        setSubmissionState("queued");
        resetFormFields();
        onSuccess?.();
      } catch {
        setSubmissionState("error");
      }
    }
  };

  const resetFormFields = () => {
    setSelectedType("");
    setNote("");
    setPlace("");
    setHoneypot("");
    setErrors({});
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Success & Queued Status Messages (role="status") */}
      {submissionState === "success" && (
        <div
          id="report-submission-status"
          role="status"
          aria-live="polite"
          className="p-4 rounded-[var(--radius-card)] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 flex items-start gap-3"
        >
          <Icon name="check" size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">{t(locale, "report.success")}</h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-200">
              Community reports are moderated by authorized staff before public publication to
              maintain trust and accuracy.
            </p>
            <button
              type="button"
              onClick={() => setSubmissionState("idle")}
              className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
            >
              Submit another report
            </button>
          </div>
        </div>
      )}

      {submissionState === "queued" && (
        <div
          id="report-queued-status"
          role="status"
          aria-live="polite"
          className="p-4 rounded-[var(--radius-card)] bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 flex items-start gap-3"
        >
          <Icon name="wifi-off" size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">
              Saved on your phone. It will be sent when you are online.
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {t(locale, "report.queued")}
            </p>
            {queuedDroppedOldest && (
              <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold mt-1">
                Queue reached the 10-item limit. The oldest queued report was replaced.
              </p>
            )}
            <button
              type="button"
              onClick={() => setSubmissionState("idle")}
              className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-200 underline cursor-pointer"
            >
              Submit another report
            </button>
          </div>
        </div>
      )}

      {/* 2. Rate Limit & General Error Alerts (role="alert") */}
      {submissionState === "rate_limited" && (
        <div
          role="alert"
          className="p-4 rounded-[var(--radius-card)] bg-orange-50 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-700 text-orange-900 dark:text-orange-100 flex items-start gap-3"
        >
          <Icon name="warning" size={20} className="text-orange-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Rate limit reached</h3>
            <p className="text-xs text-orange-800 dark:text-orange-200">
              You have submitted multiple reports recently. Please wait a short while before sending
              additional reports to prevent duplicate notices.
            </p>
          </div>
        </div>
      )}

      {submissionState === "error" && (
        <div
          role="alert"
          className="p-4 rounded-[var(--radius-card)] bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-100 flex items-start gap-3"
        >
          <Icon name="alert-triangle" size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Submission Error</h3>
            <p className="text-xs text-red-800 dark:text-red-200">{t(locale, "report.error")}</p>
          </div>
        </div>
      )}

      {/* 3. Accessible Error Summary at the Top */}
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-heading"
          className="p-4 rounded-[var(--radius-card)] bg-[var(--color-risk-danger-bg)] border border-[var(--color-risk-danger-border)] text-[var(--color-risk-danger-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
        >
          <h3 id="error-summary-heading" className="font-bold text-sm flex items-center gap-2">
            <Icon name="alert-triangle" size={16} />
            <span>There is a problem with your submission</span>
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
            {errors.type && (
              <li>
                <a href="#report-type-legend" className="underline hover:no-underline font-medium">
                  {errors.type}
                </a>
              </li>
            )}
            {errors.districtId && (
              <li>
                <a href="#report-district" className="underline hover:no-underline font-medium">
                  {errors.districtId}
                </a>
              </li>
            )}
            {errors.note && (
              <li>
                <a href="#report-note" className="underline hover:no-underline font-medium">
                  {errors.note}
                </a>
              </li>
            )}
            {errors.place && (
              <li>
                <a href="#report-place" className="underline hover:no-underline font-medium">
                  {errors.place}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* 4. Privacy Warning Banner */}
      <Card className="bg-[var(--color-bg-page)] border border-[var(--color-border-card)] p-3 text-xs sm:text-sm text-[var(--color-text-muted)] flex items-start gap-2.5">
        <Icon name="shield" size={18} className="shrink-0 text-[var(--color-primary-bg)] mt-0.5" />
        <span className="leading-relaxed">{t(locale, "report.privacyNotice")}</span>
      </Card>

      {/* 5. Main Form */}
      <Card
        as="section"
        className="bg-[var(--color-bg-card)] border border-[var(--color-border-card)] p-4 sm:p-6"
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Honeypot Field (Visually hidden, removed from tab order & accessibility tree) */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <label htmlFor="report-honeypot">Leave this blank</label>
            <input
              id="report-honeypot"
              name="honeypot"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Field 1: Condition Type Radio Group */}
          <fieldset
            id="report-type-fieldset"
            aria-describedby={errors.type ? "report-type-error" : undefined}
            className="space-y-2.5"
          >
            <legend
              id="report-type-legend"
              className="text-sm font-bold text-[var(--color-text-main)] block"
            >
              {t(locale, "report.type.label")}{" "}
              <span className="text-[var(--color-risk-danger-text)]">*</span>
            </legend>

            {errors.type && (
              <p
                id="report-type-error"
                className="text-xs font-semibold text-[var(--color-risk-danger-text)]"
              >
                {errors.type}
              </p>
            )}

            <div
              role="radiogroup"
              aria-labelledby="report-type-legend"
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
              {REPORT_TYPES.map((type) => {
                const isSelected = selectedType === type;
                const iconName = getReportTypeIcon(type);
                const label = getReportTypeLabel(type, locale);

                return (
                  <label
                    key={type}
                    htmlFor={`report-type-${type}`}
                    className={`flex items-center gap-3 p-3 rounded-[var(--radius-card)] border cursor-pointer select-none transition-colors ${
                      isSelected
                        ? "bg-[var(--color-bg-page)] border-[var(--color-primary-bg)] ring-1 ring-[var(--color-primary-bg)]"
                        : "bg-[var(--color-bg-card)] border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)]"
                    }`}
                  >
                    <input
                      id={`report-type-${type}`}
                      type="radio"
                      name="reportType"
                      value={type}
                      checked={isSelected}
                      onChange={() => setSelectedType(type)}
                      className="w-4 h-4 text-[var(--color-primary-bg)] focus:ring-[var(--color-focus-ring)] shrink-0"
                    />
                    <Icon
                      name={iconName}
                      size={18}
                      className="text-[var(--color-primary-bg)] shrink-0"
                    />
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-text-main)]">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* Field 2: District Select */}
          <div className="space-y-1.5">
            <label
              htmlFor="report-district"
              className="block text-sm font-bold text-[var(--color-text-main)]"
            >
              {t(locale, "report.district.label")}{" "}
              <span className="text-[var(--color-risk-danger-text)]">*</span>
            </label>

            <select
              id="report-district"
              name="districtId"
              value={districtId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              aria-invalid={!!errors.districtId}
              aria-describedby={errors.districtId ? "report-district-error" : undefined}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-[var(--radius-card)] bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            >
              <option value="">-- {t(locale, "report.district.select")} --</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name[locale] || d.name.en} ({d.state})
                </option>
              ))}
            </select>

            {errors.districtId && (
              <p
                id="report-district-error"
                className="text-xs font-semibold text-[var(--color-risk-danger-text)]"
              >
                {errors.districtId}
              </p>
            )}
          </div>

          {/* Field 3: Optional Place / Landmark */}
          <div className="space-y-1.5">
            <label
              htmlFor="report-place"
              className="block text-sm font-bold text-[var(--color-text-main)]"
            >
              {t(locale, "report.place.label")}
            </label>

            <input
              id="report-place"
              name="place"
              type="text"
              autoComplete="street-address"
              maxLength={80}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder={t(locale, "report.place.placeholder")}
              aria-invalid={!!errors.place}
              aria-describedby={errors.place ? "report-place-error" : undefined}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-[var(--radius-card)] bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            />

            {errors.place && (
              <p
                id="report-place-error"
                className="text-xs font-semibold text-[var(--color-risk-danger-text)]"
              >
                {errors.place}
              </p>
            )}
          </div>

          {/* Field 4: Note Textarea with Polite Character Counter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="report-note"
                className="block text-sm font-bold text-[var(--color-text-main)]"
              >
                {t(locale, "report.note.label")}{" "}
                <span className="text-[var(--color-risk-danger-text)]">*</span>
              </label>

              {/* Visual character counter */}
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                {note.length} / 200
              </span>
            </div>

            {/* Screen-reader polite announcement for counter (debounced, not announced on every single keystroke) */}
            <div role="status" aria-live="polite" className="sr-only">
              {debouncedCount} of 200 characters entered
            </div>

            <textarea
              id="report-note"
              name="note"
              rows={4}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t(locale, "report.note.placeholder")}
              aria-invalid={!!errors.note}
              aria-describedby={errors.note ? "report-note-error" : undefined}
              className="w-full p-3 rounded-[var(--radius-card)] bg-[var(--color-bg-page)] text-[var(--color-text-main)] border border-[var(--color-border-card)] text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
            />

            {errors.note && (
              <p
                id="report-note-error"
                className="text-xs font-semibold text-[var(--color-risk-danger-text)]"
              >
                {errors.note}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submissionState === "submitting"}
              aria-busy={submissionState === "submitting"}
              className="w-full sm:w-auto min-w-[180px] min-h-[48px]"
            >
              {submissionState === "submitting" ? (
                <>
                  <Icon name="refresh" size={18} className="animate-spin mr-2" />
                  <span>{t(locale, "report.submitting")}</span>
                </>
              ) : (
                <span>{t(locale, "report.submit")}</span>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ReportForm;
