import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function Footer() {
  return (
    <footer className="w-full bg-[var(--color-bg-card)] border-t border-[var(--color-border-card)] mt-auto py-8">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-sm text-[var(--color-text-muted)]">
        <div>
          <p className="font-semibold text-[var(--color-text-main)] flex items-center justify-center sm:justify-start gap-1.5">
            <Icon name="shield" size={18} />
            <span>Xahay &mdash; Community Emergency Assistant</span>
          </p>
          <p className="mt-1">
            Emergency helpline:{" "}
            <a
              href="tel:112"
              className="font-bold text-[var(--color-emergency-bg)] underline decoration-1 inline-flex items-center min-h-[48px] px-1"
            >
              Dial 112
            </a>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/about"
            className="hover:text-[var(--color-text-main)] underline min-h-[48px] inline-flex items-center"
          >
            Sources &amp; Limitations
          </Link>
          <span className="hidden sm:inline" aria-hidden="true">
            &bull;
          </span>
          <p className="m-0">Zero tracking &bull; Privacy by default</p>
        </div>
      </div>
    </footer>
  );
}
