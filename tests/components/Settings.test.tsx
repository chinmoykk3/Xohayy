import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { PreferencesProvider, usePreferences } from "@/context/PreferencesContext";
import { TextSizeToggle } from "@/components/settings/TextSizeToggle";
import { ContrastToggle } from "@/components/settings/ContrastToggle";
import { SettingsMenu } from "@/components/settings/SettingsMenu";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/en",
}));

function Consumer() {
  const { preferences, setTextScale, setHighContrast, setReducedMotion, resetPreferences } =
    usePreferences();
  return (
    <div>
      <span data-testid="scale">{preferences.textScale}</span>
      <span data-testid="contrast">{preferences.highContrast ? "high" : "normal"}</span>
      <span data-testid="motion">{preferences.reducedMotion ? "reduced" : "normal"}</span>
      <button onClick={() => setTextScale(1.5)}>Scale 1.5</button>
      <button onClick={() => setHighContrast(true)}>Contrast High</button>
      <button onClick={() => setReducedMotion(true)}>Motion Reduce</button>
      <button onClick={resetPreferences}>Reset</button>
    </div>
  );
}

describe("Preferences Context & Settings Components", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-contrast");
    document.documentElement.removeAttribute("data-text-scale");
    document.documentElement.removeAttribute("data-reduced-motion");
  });

  it("provides preferences and updates root element attributes upon change", async () => {
    render(
      <PreferencesProvider initialLocale="en">
        <Consumer />
      </PreferencesProvider>
    );

    expect(screen.getByTestId("scale").textContent).toBe("1");
    expect(screen.getByTestId("contrast").textContent).toBe("normal");

    // Change Text Scale
    fireEvent.click(screen.getByText("Scale 1.5"));
    expect(screen.getByTestId("scale").textContent).toBe("1.5");
    expect(document.documentElement.getAttribute("data-text-scale")).toBe("1.5");

    // Change Contrast
    fireEvent.click(screen.getByText("Contrast High"));
    expect(screen.getByTestId("contrast").textContent).toBe("high");
    expect(document.documentElement.getAttribute("data-contrast")).toBe("high");

    // Change Reduced Motion
    fireEvent.click(screen.getByText("Motion Reduce"));
    expect(screen.getByTestId("motion").textContent).toBe("reduced");
    expect(document.documentElement.getAttribute("data-reduced-motion")).toBe("true");

    // Reset
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByTestId("scale").textContent).toBe("1");
    expect(document.documentElement.getAttribute("data-text-scale")).toBe("1");
  });

  it("TextSizeToggle renders options and updates selection", () => {
    render(
      <PreferencesProvider initialLocale="en">
        <TextSizeToggle locale="en" />
      </PreferencesProvider>
    );

    const radioLarge = screen.getByRole("radio", { name: /Large \(125%\)/i });
    expect(radioLarge).toBeInTheDocument();
    expect(radioLarge).toHaveAttribute("aria-checked", "false");

    fireEvent.click(radioLarge);
    expect(radioLarge).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.getAttribute("data-text-scale")).toBe("1.25");
  });

  it("ContrastToggle toggles contrast state and root attribute", () => {
    render(
      <PreferencesProvider initialLocale="en">
        <ContrastToggle locale="en" />
      </PreferencesProvider>
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement.getAttribute("data-contrast")).toBe("high");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(document.documentElement.getAttribute("data-contrast")).toBe("normal");
  });

  it("SettingsMenu opens dialog, displays settings, and closes on Escape", () => {
    render(
      <PreferencesProvider initialLocale="en">
        <SettingsMenu locale="en" />
      </PreferencesProvider>
    );

    const openButton = screen.getByRole("button", { name: /Settings/i });
    expect(openButton).toBeInTheDocument();

    // Dialog is closed initially
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Open Dialog
    fireEvent.click(openButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Preferences & Accessibility")).toBeInTheDocument();

    // Close Dialog with Escape key
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
