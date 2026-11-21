"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ErrorFallback } from "@/components/common/ErrorFallback";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (typeof params?.locale === "string" ? params.locale : "en") as string;

  return <ErrorFallback error={error} reset={reset} locale={locale} isGlobal={false} />;
}
