import React from "react";

export interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-3 focus:bg-[var(--color-bg-card)] focus:text-[var(--color-text-main)] focus:border focus:border-[var(--color-primary-bg)] focus:rounded-[var(--radius-card)] focus:shadow-xl focus:font-semibold"
    >
      {label}
    </a>
  );
}
