"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import type { Locale, Preferences } from "@/types";
import {
  readPreferences,
  writePreferences,
  getDefaultPreferences,
  STORAGE_KEY,
} from "@/lib/storage";

export interface PreferencesContextValue {
  preferences: Preferences;
  updatePreferences: (partial: Partial<Preferences>) => void;
  setLocale: (locale: Locale) => void;
  setTextScale: (scale: 1 | 1.25 | 1.5) => void;
  setHighContrast: (highContrast: boolean) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setDistrict: (districtId?: string) => void;
  toggleGuideRead: (stepId: string) => void;
  toggleKitItem: (itemId: string) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/**
 * Applies active tokens directly onto document.documentElement.
 */
function applyRootAttributes(prefs: Preferences) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-contrast", prefs.highContrast ? "high" : "normal");
  root.setAttribute("data-text-scale", String(prefs.textScale));

  if (prefs.reducedMotion) {
    root.setAttribute("data-reduced-motion", "true");
  } else {
    root.removeAttribute("data-reduced-motion");
  }
}

interface PreferencesProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function PreferencesProvider({ children, initialLocale }: PreferencesProviderProps) {
  const [preferences, setPreferences] = useState<Preferences>(() => readPreferences(initialLocale));

  // Apply DOM attributes on mount and whenever preferences update
  useEffect(() => {
    applyRootAttributes(preferences);
  }, [preferences]);

  // Synchronize across tabs via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const updated = readPreferences(initialLocale);
        setPreferences(updated);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [initialLocale]);

  const updatePreferences = useCallback((partial: Partial<Preferences>) => {
    setPreferences((prev) => {
      const next: Preferences = { ...prev, ...partial };
      writePreferences(next);
      return next;
    });
  }, []);

  const setLocale = useCallback(
    (locale: Locale) => {
      updatePreferences({ locale });
    },
    [updatePreferences]
  );

  const setTextScale = useCallback(
    (textScale: 1 | 1.25 | 1.5) => {
      updatePreferences({ textScale });
    },
    [updatePreferences]
  );

  const setHighContrast = useCallback(
    (highContrast: boolean) => {
      updatePreferences({ highContrast });
    },
    [updatePreferences]
  );

  const setReducedMotion = useCallback(
    (reducedMotion: boolean) => {
      updatePreferences({ reducedMotion });
    },
    [updatePreferences]
  );

  const setDistrict = useCallback(
    (districtId?: string) => {
      updatePreferences({ districtId });
    },
    [updatePreferences]
  );

  const toggleGuideRead = useCallback((stepId: string) => {
    setPreferences((prev) => {
      const set = new Set(prev.readGuides);
      if (set.has(stepId)) {
        set.delete(stepId);
      } else {
        set.add(stepId);
      }
      const next: Preferences = { ...prev, readGuides: Array.from(set) };
      writePreferences(next);
      return next;
    });
  }, []);

  const toggleKitItem = useCallback((itemId: string) => {
    setPreferences((prev) => {
      const set = new Set(prev.kitChecked);
      if (set.has(itemId)) {
        set.delete(itemId);
      } else {
        set.add(itemId);
      }
      const next: Preferences = { ...prev, kitChecked: Array.from(set) };
      writePreferences(next);
      return next;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences((prev) => {
      const reset = getDefaultPreferences(prev.locale);
      writePreferences(reset);
      return reset;
    });
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      updatePreferences,
      setLocale,
      setTextScale,
      setHighContrast,
      setReducedMotion,
      setDistrict,
      toggleGuideRead,
      toggleKitItem,
      resetPreferences,
    }),
    [
      preferences,
      updatePreferences,
      setLocale,
      setTextScale,
      setHighContrast,
      setReducedMotion,
      setDistrict,
      toggleGuideRead,
      toggleKitItem,
      resetPreferences,
    ]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
