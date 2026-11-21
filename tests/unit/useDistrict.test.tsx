import React from "react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useDistrict } from "@/hooks/useDistrict";
import { PreferencesProvider } from "@/context/PreferencesContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return <PreferencesProvider initialLocale="en">{children}</PreferencesProvider>;
}

describe("useDistrict Hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with null district when no preference is saved", () => {
    const { result } = renderHook(() => useDistrict(), { wrapper });

    expect(result.current.district).toBeNull();
    expect(result.current.districtId).toBeNull();
    expect(result.current.riskSummary).toBeNull();
    expect(result.current.districts.length).toBeGreaterThan(0);
  });

  it("updates district and derives risk summary when setDistrict is called", () => {
    const { result } = renderHook(() => useDistrict(), { wrapper });

    act(() => {
      result.current.setDistrict("dhemaji");
    });

    expect(result.current.district).not.toBeNull();
    expect(result.current.district?.id).toBe("dhemaji");
    expect(result.current.districtId).toBe("dhemaji");

    // Dhemaji has severe flood alert in seed sample data
    expect(result.current.riskSummary).not.toBeNull();
    expect(result.current.riskSummary?.level).toBe("severe");
    expect(result.current.riskSummary?.isDemo).toBe(true);
  });

  it("falls back to low risk normal conditions for district with no active alerts", () => {
    const { result } = renderHook(() => useDistrict(), { wrapper });

    act(() => {
      result.current.setDistrict("golaghat");
    });

    expect(result.current.district?.id).toBe("golaghat");
    expect(result.current.riskSummary?.level).toBe("low");
    expect(result.current.riskSummary?.activeAlertCount).toBe(0);
  });

  it("clears district when clearDistrict is called", () => {
    const { result } = renderHook(() => useDistrict(), { wrapper });

    act(() => {
      result.current.setDistrict("majuli");
    });
    expect(result.current.district?.id).toBe("majuli");

    act(() => {
      result.current.clearDistrict();
    });
    expect(result.current.district).toBeNull();
    expect(result.current.riskSummary).toBeNull();
  });
});
