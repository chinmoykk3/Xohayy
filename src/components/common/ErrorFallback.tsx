"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  locale?: string;
  isGlobal?: boolean;
}

interface ErrorMessages {
  title: string;
  description: string;
  retry: string;
  home: string;
  emergencyHeading: string;
  emergencyNote: string;
}

const DEFAULT_MESSAGES: ErrorMessages = {
  title: "Something went wrong",
  description:
    "We encountered an unexpected technical issue. Do not worry—your emergency contacts and cached directives remain accessible below.",
  retry: "Try again",
  home: "Return to Home",
  emergencyHeading: "Emergency Lifeline Contacts",
  emergencyNote: "In any life-threatening situation, call 112 directly. Works without mobile data.",
};

const MESSAGES: Record<string, ErrorMessages> = {
  en: DEFAULT_MESSAGES,
  as: {
    title: "এক অপ্ৰত্যাশিত সমস্যা হৈছে",
    description:
      "এটা প্ৰযুক্তিগত সমস্যা দেখা দিছে। চিন্তিত নহ'ব—আপোনাৰ জৰুৰীকালীন যোগাযোগ নম্বৰ আৰু সংৰক্ষিত নিৰ্দেশনা তলত উপলব্ধ আছে।",
    retry: "পুনৰ চেষ্টা কৰক",
    home: "মূল পৃষ্ঠালৈ যাওক",
    emergencyHeading: "জৰুৰীকালীন যোগাযোগ নম্বৰ",
    emergencyNote:
      "যিকোনো জৰুৰীকালীন পৰিস্থিতিত পোনপটীয়াকৈ ১১২ নম্বৰত কল কৰক। ইন্টাৰনেট নোহোৱাকৈও কাম কৰে।",
  },
  hi: {
    title: "कुछ गलत हो गया",
    description:
      "एक अप्रत्याशित तकनीकी समस्या आई है। चिंता न करें—आपके आपातकालीन संपर्क और सुरक्षित निर्देश नीचे उपलब्ध हैं।",
    retry: "पुनः प्रयास करें",
    home: "मुख्य पृष्ठ पर जाएं",
    emergencyHeading: "आपातकालीन हेल्पलाइन नंबर",
    emergencyNote: "किसी भी आपातकालीन स्थिति में सीधे 112 पर कॉल करें। बिना इंटरनेट के भी काम करता है।",
  },
};

export function ErrorFallback({
  error,
  reset,
  locale = "en",
  isGlobal = false,
}: ErrorFallbackProps) {
  const validLocale = (locale in MESSAGES ? locale : "en") as Locale;
  const msg: ErrorMessages = MESSAGES[validLocale] ?? DEFAULT_MESSAGES;

  useEffect(() => {
    // In production or test, log non-PII error digest for debugging
  }, [error]);

  const content = (
    <div
      role="alert"
      aria-live="assertive"
      className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm space-y-6"
    >
      <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
        <Icon name="alert-triangle" size={32} className="shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {msg.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {msg.description}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button variant="primary" onClick={() => reset()} className="flex items-center gap-2">
          <Icon name="refresh" size={16} />
          <span>{msg.retry}</span>
        </Button>
        <Link
          href={`/${validLocale}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Icon name="arrow-right" size={16} />
          <span>{msg.home}</span>
        </Link>
      </div>

      {/* Emergency numbers are always rendered and clickable with tel: */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <Icon name="phone" size={18} className="text-red-600" />
          <span>{msg.emergencyHeading}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{msg.emergencyNote}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a
            href="tel:112"
            className="flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-base rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            <Icon name="phone" size={18} />
            <span>Call 112</span>
          </a>
          <a
            href="tel:1070"
            className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <span>State EOC: 1070</span>
          </a>
          <a
            href="tel:1077"
            className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold text-sm rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          >
            <span>District DEOC: 1077</span>
          </a>
        </div>
      </div>
    </div>
  );

  if (isGlobal) {
    return (
      <html lang={validLocale}>
        <body className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
          {content}
        </body>
      </html>
    );
  }

  return content;
}
