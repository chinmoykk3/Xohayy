import type { Locale } from "@/types";

export interface VoiceSelection {
  voice: SpeechSynthesisVoice | null;
  isFallback: boolean;
  fallbackLang?: string;
  reason?: "missing_voice" | "unsupported";
}

/**
 * Checks if SpeechSynthesis API is supported in current browser environment.
 */
export function isSpeechSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "speechSynthesis" in window &&
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * Pure function to choose the best matching voice for a given locale.
 * For Assamese ("as"), falls back to Hindi ("hi") with isFallback=true when no native Assamese voice is available.
 */
export function getBestVoice(voices: SpeechSynthesisVoice[], locale: Locale): VoiceSelection {
  if (!voices || voices.length === 0) {
    return { voice: null, isFallback: false, reason: "missing_voice" };
  }

  const normalizedLocale = locale.toLowerCase();

  if (normalizedLocale === "as") {
    // 1. Try native Assamese voice
    const asVoice = voices.find(
      (v) => v.lang.toLowerCase() === "as-in" || v.lang.toLowerCase().startsWith("as")
    );
    if (asVoice) {
      return { voice: asVoice, isFallback: false };
    }

    // 2. Fall back to Hindi voice with isFallback notice
    const hiVoice = voices.find(
      (v) => v.lang.toLowerCase() === "hi-in" || v.lang.toLowerCase().startsWith("hi")
    );
    if (hiVoice) {
      return { voice: hiVoice, isFallback: true, fallbackLang: "hi" };
    }

    return { voice: null, isFallback: false, reason: "missing_voice" };
  }

  if (normalizedLocale === "hi") {
    const hiVoice = voices.find(
      (v) => v.lang.toLowerCase() === "hi-in" || v.lang.toLowerCase().startsWith("hi")
    );
    if (hiVoice) {
      return { voice: hiVoice, isFallback: false };
    }
    return { voice: null, isFallback: false, reason: "missing_voice" };
  }

  // Default: English ("en")
  // Prefer Indian English (en-IN) then any English
  const enInVoice = voices.find((v) => v.lang.toLowerCase() === "en-in");
  if (enInVoice) {
    return { voice: enInVoice, isFallback: false };
  }

  const anyEnVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  if (anyEnVoice) {
    return { voice: anyEnVoice, isFallback: false };
  }

  // Fallback to first available voice or null
  return { voice: voices[0] || null, isFallback: false };
}

export interface SpeakOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Safely speaks text via window.speechSynthesis.
 */
export function speakText(
  text: string,
  options: SpeakOptions = {}
): SpeechSynthesisUtterance | null {
  if (!isSpeechSupported()) {
    options.onError?.(new Error("Speech synthesis is not supported"));
    return null;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new window.SpeechSynthesisUtterance(text);
    if (options.voice) {
      utterance.voice = options.voice;
      utterance.lang = options.voice.lang;
    }
    if (options.rate !== undefined) {
      utterance.rate = options.rate;
    }
    if (options.pitch !== undefined) {
      utterance.pitch = options.pitch;
    }

    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    options.onError?.(err);
    return null;
  }
}

/**
 * Safely pauses speech.
 */
export function pauseSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.pause();
  } catch {
    // Ignore error
  }
}

/**
 * Safely resumes speech.
 */
export function resumeSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.resume();
  } catch {
    // Ignore error
  }
}

/**
 * Safely cancels all active and pending speech synthesis.
 */
export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore error
  }
}
