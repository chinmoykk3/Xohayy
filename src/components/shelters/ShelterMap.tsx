"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { t } from "@/i18n/config";
import type { Facility, Locale } from "@/types";

export interface ShelterMapProps {
  facilities: Facility[];
  locale: Locale;
  className?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ShelterMap({ facilities, locale, className = "" }: ShelterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Avoid double initialization
    if (mapRef.current) return;

    // Initialize Leaflet map
    const map = L.map(containerRef.current, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
    });
    mapRef.current = map;

    // Add OpenStreetMap tile layer with clear attribution per spec (FR-20, Section 17.5)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Filter facilities that have coordinates
    const mappableFacilities = facilities.filter(
      (f): f is Facility & { lat: number; lng: number } =>
        typeof f.lat === "number" && typeof f.lng === "number" && !isNaN(f.lat) && !isNaN(f.lng)
    );

    // Create markers with custom SVG icons (no external image 404s)
    mappableFacilities.forEach((facility) => {
      const isHospital = facility.type === "hospital";
      const name = facility.name[locale] || facility.name.en;
      const landmark = facility.landmark[locale] || facility.landmark.en;
      const pinColor = isHospital ? "#dc2626" : "#2563eb";

      const icon = L.divIcon({
        className: "shelter-map-custom-marker",
        html: `
          <div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); cursor: pointer;" aria-hidden="true">
            <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 0C6.268 0 0 6.268 0 14C0 23.5 14 36 14 36C14 36 28 23.5 28 14C28 6.268 21.732 0 14 0Z" fill="${pinColor}" stroke="#ffffff" stroke-width="2"/>
              <circle cx="14" cy="13" r="8" fill="#ffffff"/>
              ${
                isHospital
                  ? '<path d="M14 8.5V17.5M9.5 13H18.5" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>'
                  : '<path d="M14 8L8 18H20L14 8Z" fill="#2563eb"/>'
              }
            </svg>
          </div>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([facility.lat, facility.lng], {
        icon,
        title: name,
        alt: `${name} (${isHospital ? "Hospital" : "Relief Shelter"})`,
      });

      const typeLabel = isHospital
        ? t(locale, "shelters.filter.hospital")
        : t(locale, "shelters.filter.shelter");

      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`;
      const demoLabel = t(locale, "common.demoTag");
      const openMapsLabel = t(locale, "shelters.openMaps");

      const popupHtml = `
        <div class="p-1 space-y-1.5 min-w-[200px] max-w-[260px] text-left">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
            <span style="font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; ${
              isHospital
                ? "background: #fee2e2; color: #991b1b;"
                : "background: #dbeafe; color: #1e40af;"
            }">
              ${escapeHtml(typeLabel)}
            </span>
            ${
              facility.isDemo
                ? `<span style="font-size: 10px; font-weight: 600; padding: 2px 5px; border-radius: 9999px; background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;">${escapeHtml(demoLabel)}</span>`
                : ""
            }
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #111827; margin: 4px 0 2px; line-height: 1.25;">
            ${escapeHtml(name)}
          </h4>
          <p style="font-size: 12px; color: #4b5563; margin: 0; line-height: 1.4;">
            ${escapeHtml(landmark)}
          </p>
          ${
            facility.capacity
              ? `<div style="font-size: 11px; font-weight: 600; color: #374151;">
                   Capacity: ${facility.capacity} people
                 </div>`
              : ""
          }
          <div style="font-size: 10px; color: #9ca3af;">
            Verified: ${escapeHtml(facility.lastVerified)}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; padding-top: 6px; border-top: 1px solid #e5e7eb; margin-top: 6px;">
            ${
              facility.phone
                ? `<a href="tel:${escapeHtml(facility.phone)}" style="font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: underline;">
                     📞 ${escapeHtml(facility.phone)}
                   </a>`
                : ""
            }
            <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; font-weight: 600; color: #2563eb; text-decoration: underline;">
              ↗ ${escapeHtml(openMapsLabel)}
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.addTo(markersLayer);
    });

    // Fit map bounds
    if (mappableFacilities.length > 0) {
      const bounds = L.latLngBounds(mappableFacilities.map((f) => [f.lat, f.lng]));
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
    } else {
      // Default view centered on North East India
      map.setView([26.2006, 92.9376], 7);
    }

    // Force layout recalculation after mounting
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [facilities, locale]);

  return (
    <div
      ref={containerRef}
      id="shelter-map"
      role="region"
      aria-label={t(locale, "shelters.map.title")}
      tabIndex={0}
      className={`w-full h-[400px] sm:h-[480px] rounded-[var(--radius-card)] overflow-hidden border border-[var(--color-border-card)] relative z-0 ${className}`}
    />
  );
}

export default ShelterMap;
