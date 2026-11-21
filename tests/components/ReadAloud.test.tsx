import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReadAloud } from "@/components/speech/ReadAloud";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/en/guides",
}));

describe("ReadAloud Component", () => {
  let originalSpeechSynthesis: SpeechSynthesis | undefined;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockPause: ReturnType<typeof vi.fn>;
  let mockResume: ReturnType<typeof vi.fn>;
  let mockGetVoices: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalSpeechSynthesis = window.speechSynthesis;
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockPause = vi.fn();
    mockResume = vi.fn();
    mockGetVoices = vi
      .fn()
      .mockReturnValue([
        { name: "Google Indian English", lang: "en-IN", default: true } as SpeechSynthesisVoice,
        { name: "Google हिन्दी", lang: "hi-IN", default: false } as SpeechSynthesisVoice,
      ]);

    // Setup mock SpeechSynthesis
    Object.defineProperty(window, "speechSynthesis", {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        pause: mockPause,
        resume: mockResume,
        getVoices: mockGetVoices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    // Setup mock SpeechSynthesisUtterance
    class MockSpeechSynthesisUtterance {
      text: string;
      lang = "en-US";
      voice: SpeechSynthesisVoice | null = null;
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  });

  afterEach(() => {
    if (originalSpeechSynthesis) {
      Object.defineProperty(window, "speechSynthesis", {
        writable: true,
        configurable: true,
        value: originalSpeechSynthesis,
      });
    }
    vi.clearAllMocks();
  });

  it("renders play and stop buttons with accessible labels", () => {
    render(<ReadAloud text="Flood warning step 1" locale="en" />);
    expect(screen.getByRole("button", { name: /Read aloud/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Stop reading/i })).toBeInTheDocument();
  });

  it("calls speech synthesis speak on play click", () => {
    render(<ReadAloud text="Flood warning step 1" locale="en" />);
    const playBtn = screen.getByRole("button", { name: /Read aloud/i });
    fireEvent.click(playBtn);
    expect(mockSpeak).toHaveBeenCalled();
  });

  it("displays fallback notice when Assamese locale falls back to Hindi voice", () => {
    render(<ReadAloud text="বানপানী সতৰ্কতা ১" locale="as" />);
    expect(screen.getByText(/বিকল্প হিচাপে হিন্দী ভয়েচ ব্যৱহাৰ কৰা হৈছে/i)).toBeInTheDocument();
  });

  it("displays unavailable notice when speech synthesis is unsupported", () => {
    // Delete speechSynthesis to simulate unsupported browser
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).speechSynthesis;

    render(<ReadAloud text="Sample text" locale="en" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("changes speed rate between normal and slow", () => {
    render(<ReadAloud text="Speed test" locale="en" />);
    const slowBtn = screen.getByRole("button", { name: "0.8x" });
    fireEvent.click(slowBtn);
    expect(slowBtn).toHaveAttribute("aria-pressed", "true");

    const normalBtn = screen.getByRole("button", { name: "1.0x" });
    fireEvent.click(normalBtn);
    expect(normalBtn).toHaveAttribute("aria-pressed", "true");
  });
});
