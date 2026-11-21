"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * RouteFocus: WCAG 2.2 AA compliant route change focus manager.
 * Moves programmatic focus to the primary <h1 tabIndex={-1}> in <main>
 * upon client route navigation, ensuring screen readers announce the new page context.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Avoid stealing focus on initial full page load (skip link should be first)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const mainHeading = document.querySelector<HTMLElement>(
        "main h1, main [role='heading'][aria-level='1']"
      );
      if (mainHeading) {
        if (!mainHeading.hasAttribute("tabindex")) {
          mainHeading.setAttribute("tabindex", "-1");
        }
        mainHeading.focus({ preventScroll: false });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
