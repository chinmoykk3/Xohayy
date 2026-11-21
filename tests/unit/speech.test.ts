import { describe, it, expect } from "vitest";
import {
  isSpeechSupported,
  getBestVoice,
  speakText,
  pauseSpeech,
  resumeSpeech,
  stopSpeech,
} from "@/lib/speech";

describe("speech library", () => {
  const mockVoices = [
    {
      name: "Google UK English Female",
      lang: "en-GB",
      default: false,
      localService: false,
      voiceURI: "en-GB",
    },
    {
      name: "Google Indian English",
      lang: "en-IN",
      default: true,
      localService: true,
      voiceURI: "en-IN",
    },
    { name: "Google हिन्दी", lang: "hi-IN", default: false, localService: true, voiceURI: "hi-IN" },
  ] as SpeechSynthesisVoice[];

  it("chooses Indian English for English locale", () => {
    const selection = getBestVoice(mockVoices, "en");
    expect(selection.voice).not.toBeNull();
    expect(selection.voice?.lang).toBe("en-IN");
    expect(selection.isFallback).toBe(false);
  });

  it("chooses Hindi voice for Hindi locale", () => {
    const selection = getBestVoice(mockVoices, "hi");
    expect(selection.voice).not.toBeNull();
    expect(selection.voice?.lang).toBe("hi-IN");
    expect(selection.isFallback).toBe(false);
  });

  it("falls back to Hindi with isFallback=true when Assamese voice is missing", () => {
    const selection = getBestVoice(mockVoices, "as");
    expect(selection.voice).not.toBeNull();
    expect(selection.voice?.lang).toBe("hi-IN");
    expect(selection.isFallback).toBe(true);
    expect(selection.fallbackLang).toBe("hi");
  });

  it("prefers native Assamese voice if available", () => {
    const voicesWithAssamese = [
      ...mockVoices,
      {
        name: "Assamese Voice",
        lang: "as-IN",
        default: false,
        localService: true,
        voiceURI: "as-IN",
      } as SpeechSynthesisVoice,
    ];
    const selection = getBestVoice(voicesWithAssamese, "as");
    expect(selection.voice).not.toBeNull();
    expect(selection.voice?.lang).toBe("as-IN");
    expect(selection.isFallback).toBe(false);
  });

  it("returns null voice with reason missing_voice when no matching voices exist", () => {
    const onlyEnglish: SpeechSynthesisVoice[] = [mockVoices[0]!];
    const selection = getBestVoice(onlyEnglish, "hi");
    expect(selection.voice).toBeNull();
    expect(selection.isFallback).toBe(false);
    expect(selection.reason).toBe("missing_voice");
  });

  it("returns null voice when voice array is empty", () => {
    const selection = getBestVoice([], "en");
    expect(selection.voice).toBeNull();
    expect(selection.reason).toBe("missing_voice");
  });

  it("isSpeechSupported accurately reflects window environment", () => {
    expect(typeof isSpeechSupported()).toBe("boolean");
  });

  it("safe speech functions do not throw in mock or unsupported environments", () => {
    expect(() => pauseSpeech()).not.toThrow();
    expect(() => resumeSpeech()).not.toThrow();
    expect(() => stopSpeech()).not.toThrow();
    expect(() => speakText("Test text")).not.toThrow();
  });
});
