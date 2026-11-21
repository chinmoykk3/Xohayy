"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { t } from "@/i18n/config";
import type { Locale } from "@/types";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  locale: Locale;
  navLinks: NavLink[];
}

export function MobileMenu({ locale, navLinks }: MobileMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex items-center">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? t(locale, "common.close") : t(locale, "common.menu")}
          className="inline-flex items-center justify-center min-h-[40px] min-w-[40px] sm:min-h-[48px] sm:min-w-[48px] p-1.5 text-[var(--color-text-main)] rounded-md hover:bg-[var(--color-bg-page)]"
        >
          <Icon name={isMenuOpen ? "close" : "menu"} size={22} />
        </button>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[var(--color-border-card)] bg-[var(--color-bg-card)] px-4 py-3 flex flex-col gap-1"
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
    </>
  );
}

export default MobileMenu;
