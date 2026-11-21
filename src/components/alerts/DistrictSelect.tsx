"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";
import { useDistrict } from "@/hooks/useDistrict";
import { DEFAULT_LOCALE, t } from "@/i18n/config";
import type { District, Locale } from "@/types";

export interface DistrictSelectProps {
  locale?: Locale;
  className?: string;
  onSelect?: (district: District | null) => void;
}

export function DistrictSelect({
  locale = DEFAULT_LOCALE,
  className = "",
  onSelect,
}: DistrictSelectProps) {
  const { district, setDistrict, clearDistrict, districts } = useDistrict();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Debounce search query by 150ms for smooth performance on lower-end devices
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter districts across localized names (en, as, hi) and state
  const filteredDistricts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return districts;

    return districts.filter((d) => {
      const enMatch = d.name.en.toLowerCase().includes(q);
      const asMatch = d.name.as.toLowerCase().includes(q);
      const hiMatch = d.name.hi.toLowerCase().includes(q);
      const stateMatch = d.state.toLowerCase().includes(q);
      const slugMatch = d.id.toLowerCase().includes(q);
      return enMatch || asMatch || hiMatch || stateMatch || slugMatch;
    });
  }, [districts, debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (selected: District | null) => {
      if (selected) {
        setDistrict(selected.id);
        onSelect?.(selected);
      } else {
        clearDistrict();
        onSelect?.(null);
      }
      setIsOpen(false);
      setQuery("");
      setHighlightedIndex(-1);
    },
    [setDistrict, clearDistrict, onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredDistricts.length - 1 ? prev + 1 : 0));
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredDistricts.length - 1));
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredDistricts.length) {
          handleSelect(filteredDistricts[highlightedIndex]!);
        } else if (filteredDistricts.length === 1) {
          handleSelect(filteredDistricts[0]!);
        }
        break;
      }
      case "Escape": {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      }
      case "Tab": {
        setIsOpen(false);
        break;
      }
      case "Home": {
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      }
      case "End": {
        e.preventDefault();
        setHighlightedIndex(filteredDistricts.length - 1);
        break;
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll("li");
      const activeItem = items[highlightedIndex];
      if (activeItem && typeof activeItem.scrollIntoView === "function") {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const selectedName = district ? district.name[locale] || district.name.en : "";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <label
        htmlFor="district-combobox-input"
        className="block text-sm font-semibold text-[var(--color-text-main)] mb-1.5"
      >
        {t(locale, "home.districtSelect")}
      </label>

      {/* Selected District Badge / Combobox Trigger Row */}
      <div className="relative flex items-center">
        <span
          className="absolute left-3.5 text-[var(--color-text-muted)] pointer-events-none"
          aria-hidden="true"
        >
          <Icon name="map-pin" size={18} />
        </span>

        <input
          id="district-combobox-input"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls="district-listbox"
          aria-activedescendant={
            highlightedIndex >= 0 && filteredDistricts[highlightedIndex]
              ? `district-opt-${filteredDistricts[highlightedIndex]?.id}`
              : undefined
          }
          value={isOpen ? query : selectedName}
          placeholder={selectedName || t(locale, "district.selectPlaceholder")}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[48px] pl-10 pr-20 py-2.5 rounded-[var(--radius-card)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-card)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] text-base font-medium shadow-xs"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {district && (
            <button
              type="button"
              onClick={() => handleSelect(null)}
              aria-label={t(locale, "district.clear")}
              title={t(locale, "district.clear")}
              className="min-h-[40px] min-w-[40px] p-2 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-page)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }}
            aria-label={isOpen ? t(locale, "common.close") : t(locale, "district.change")}
            className="min-h-[40px] min-w-[40px] p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] flex items-center justify-center cursor-pointer"
          >
            <span aria-hidden="true" className="text-xs">
              {isOpen ? "▲" : "▼"}
            </span>
          </button>
        </div>
      </div>

      {/* Accessible Listbox Dropdown */}
      {isOpen && (
        <ul
          id="district-listbox"
          ref={listboxRef}
          role="listbox"
          aria-label={t(locale, "home.districtSelect")}
          className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-bg-card)] border border-[var(--color-border-card)] shadow-lg py-1 focus:outline-none"
        >
          {filteredDistricts.length === 0 ? (
            <li role="status" className="px-4 py-3 text-sm text-[var(--color-text-muted)] italic">
              {t(locale, "district.noResults", { query })}
            </li>
          ) : (
            filteredDistricts.map((d, index) => {
              const isSelected = district?.id === d.id;
              const isHighlighted = highlightedIndex === index;
              const displayName = d.name[locale] || d.name.en;

              return (
                <li
                  key={d.id}
                  id={`district-opt-${d.id}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(d)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center justify-between px-4 py-3 min-h-[48px] text-base cursor-pointer transition-colors ${
                    isHighlighted
                      ? "bg-[var(--color-bg-page)] text-[var(--color-text-main)] font-semibold"
                      : "text-[var(--color-text-main)]"
                  } ${isSelected ? "border-l-4 border-l-[var(--color-primary-bg)] font-bold" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      name="map-pin"
                      size={18}
                      className={
                        isSelected
                          ? "text-[var(--color-primary-bg)]"
                          : "text-[var(--color-text-muted)]"
                      }
                    />
                    <span>{displayName}</span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-1">({d.state})</span>
                  </div>

                  {isSelected && (
                    <span className="text-[var(--color-primary-bg)]" aria-hidden="true">
                      <Icon name="check" size={18} />
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
