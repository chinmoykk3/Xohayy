"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  isSpeechSupported,
  getBestVoice,
  speakText,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
} from "@/lib/speech";
import type { Locale } from "@/types";

export type SpeechStatus = "idle" | "playing" | "paused" | "unsupported";

export interface UseSpeechOptions {
  locale: Locale;
  defaultRate?: number;
}

export function useSpeech({ locale, defaultRate = 1.0 }: UseSpeechOptions) {
  const pathname = usePathname();
  const isSupported = isSpeechSupported();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [rawStatus, setRawStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [rate, setRate] = useState<number>(defaultRate);

  const status: SpeechStatus = !isSupported ? "unsupported" : rawStatus;

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Compute best matching voice as derived state
  const selection = useMemo(() => {
    if (!isSupported) {
      return { voice: null, isFallback: false, reason: "unsupported" as const };
    }
    return getBestVoice(voices, locale);
  }, [voices, locale, isSupported]);

  // Load voices asynchronously and handle voiceschanged event
  useEffect(() => {
    if (!isSpeechSupported()) return;

    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices();
        setVoices(available);
      } catch {
        setVoices([]);
      }
    };

    updateVoices();

    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
      };
    } else {
      window.speechSynthesis.onvoiceschanged = updateVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Cancel speech on unmount or when route changes
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [pathname]);

  const speak = useCallback(
    (text: string) => {
      if (!isSpeechSupported()) {
        return;
      }

      // If currently paused, resume
      if (rawStatus === "paused") {
        resumeSpeech();
        setRawStatus("playing");
        return;
      }

      // If no voice available for this locale and no fallback
      if (!selection.voice && voices.length > 0) {
        setRawStatus("idle");
        return;
      }

      const utterance = speakText(text, {
        voice: selection.voice,
        rate,
        onStart: () => setRawStatus("playing"),
        onEnd: () => {
          setRawStatus("idle");
          activeUtteranceRef.current = null;
        },
        onError: () => {
          setRawStatus("idle");
          activeUtteranceRef.current = null;
        },
      });

      activeUtteranceRef.current = utterance;
    },
    [rawStatus, selection.voice, voices.length, rate]
  );

  const pause = useCallback(() => {
    pauseSpeech();
    setRawStatus("paused");
  }, []);

  const resume = useCallback(() => {
    resumeSpeech();
    setRawStatus("playing");
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
    setRawStatus("idle");
    activeUtteranceRef.current = null;
  }, []);

  return {
    status,
    isSupported,
    voice: selection.voice,
    isFallback: selection.isFallback,
    fallbackLang: selection.fallbackLang,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop,
  };
}
