"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Toast } from "@/components/ui/Toast";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { Locale } from "@/types";

/**
 * Checks whether any form on the page contains unsaved / dirty user input.
 * Conforms to Section 21.7: never force a reload during a form entry.
 */
export function hasUnsavedFormInput(): boolean {
  if (typeof document === "undefined") return false;

  const forms = Array.from(document.forms);
  for (const form of forms) {
    const elements = Array.from(form.elements);
    for (const el of elements) {
      if (el instanceof HTMLInputElement) {
        if (
          el.type === "hidden" ||
          el.type === "submit" ||
          el.type === "button" ||
          el.type === "reset"
        ) {
          continue;
        }
        if (el.type === "checkbox" || el.type === "radio") {
          if (el.checked !== el.defaultChecked) return true;
        } else if (el.value !== el.defaultValue && el.value.trim().length > 0) {
          return true;
        }
      } else if (el instanceof HTMLTextAreaElement) {
        if (el.value !== el.defaultValue && el.value.trim().length > 0) {
          return true;
        }
      } else if (el instanceof HTMLSelectElement) {
        for (let i = 0; i < el.options.length; i++) {
          const opt = el.options[i];
          if (opt && opt.selected !== opt.defaultSelected) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export interface ServiceWorkerRegisterProps {
  locale?: Locale;
}

/**
 * Service Worker registration and update manager component (Phase 17, Section 21.7).
 * - Registers /sw.js in production environments
 * - Detects when a new service worker is in waiting state
 * - Displays a non-intrusive toast: "A new version is available. Refresh."
 * - Refuses to reload if a form has unsaved input
 * - Never reloads automatically
 */
export function ServiceWorkerRegister({ locale = DEFAULT_LOCALE }: ServiceWorkerRegisterProps) {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    // Skip in test environment or if service workers are unsupported
    if (process.env.NODE_ENV === "test" || !("serviceWorker" in navigator)) {
      return;
    }

    let isMounted = true;

    const handleWaitingWorker = (worker: ServiceWorker) => {
      if (!isMounted) return;
      setWaitingWorker(worker);
      setShowUpdateToast(true);
    };

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // 1. If a worker is already waiting when the page loads
        if (registration.waiting) {
          handleWaitingWorker(registration.waiting);
        }

        // 2. If a new worker installs and transitions to waiting
        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
              handleWaitingWorker(installingWorker);
            }
          });
        });
      } catch {
        // Silently catch registration failures in restrictive sandbox
      }
    };

    registerWorker();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = useCallback(() => {
    if (hasUnsavedFormInput()) {
      setWarningMessage(
        t(locale, "sw.unsavedFormWarning") ||
          "Please save or submit your open form before refreshing."
      );
      return;
    }

    setWarningMessage(null);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }

    // Refresh page manually on user request
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, [waitingWorker, locale]);

  return (
    <>
      {/* Toast when a new service worker version is waiting */}
      <Toast
        isOpen={showUpdateToast}
        type="info"
        message={t(locale, "sw.updateAvailable") || "A new version is available."}
        action={{
          label: t(locale, "sw.refresh") || "Refresh",
          onClick: handleRefresh,
        }}
        onClose={() => setShowUpdateToast(false)}
      />

      {/* Warning toast if user taps Refresh while having unsaved inputs */}
      <Toast
        isOpen={Boolean(warningMessage)}
        type="alert"
        message={warningMessage ?? ""}
        onClose={() => setWarningMessage(null)}
      />
    </>
  );
}
