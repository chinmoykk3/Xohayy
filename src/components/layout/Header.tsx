"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/alerts", label: "Alerts" },
    { href: "/guides", label: "Guides" },
    { href: "/shelters", label: "Shelters" },
    { href: "/report", label: "Report" },
  ];

  return (
    <header className="w-full bg-[var(--color-bg-card)] border-b border-[var(--color-border-card)] sticky top-0 z-40">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[var(--color-text-main)] min-h-[48px] min-w-[48px] py-2"
        >
          <span className="w-8 h-8 rounded-[var(--radius-card)] bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] flex items-center justify-center text-sm font-bold">
            X
          </span>
          <span className="tracking-tight">Xahay</span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center min-h-[48px] px-3 py-2 text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex items-center">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] p-2 text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)]"
          >
            <Icon name={isMenuOpen ? "close" : "menu"} size={26} />
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="sm:hidden border-t border-[var(--color-border-card)] bg-[var(--color-bg-card)] px-4 py-3 flex flex-col gap-1"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center min-h-[48px] px-3 py-2 text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
