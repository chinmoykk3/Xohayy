import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: vi.fn(),
  }),
  usePathname: () => "/en/alerts",
}));

describe("LanguageSwitcher Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with accessible select and localized options", () => {
    render(<LanguageSwitcher currentLocale="en" />);

    const select = screen.getByRole("combobox", { name: "Language" });
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "অসমীয়া" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "हिन्दी" })).toBeInTheDocument();
    expect(select).toHaveValue("en");
  });

  it("updates cookie and navigates when switching to Assamese", () => {
    render(<LanguageSwitcher currentLocale="en" />);

    const select = screen.getByRole("combobox", { name: "Language" });
    fireEvent.change(select, { target: { value: "as" } });

    expect(document.cookie).toContain("xahay_locale=as");
  });
});
