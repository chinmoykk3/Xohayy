"use client";

import React from "react";
import { Icon } from "./Icon";

export interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "info" | "success" | "alert";
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({ isOpen, message, type = "info", onClose, action }: ToastProps) {
  if (!isOpen) return null;

  const typeStyles: Record<"info" | "success" | "alert", string> = {
    info: "bg-[var(--color-bg-card)] border-[var(--color-primary-bg)] text-[var(--color-text-main)]",
    success:
      "bg-[var(--color-risk-low-bg)] border-[var(--color-risk-low-border)] text-[var(--color-risk-low-text)]",
    alert:
      "bg-[var(--color-risk-danger-bg)] border-[var(--color-risk-danger-border)] text-[var(--color-risk-danger-text)]",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 p-4 border rounded-[var(--radius-card)] shadow-lg flex items-center justify-between gap-3 ${typeStyles[type]}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon
          name={type === "alert" ? "alert-triangle" : type === "success" ? "check" : "info"}
          size={22}
          className="shrink-0"
        />
        <span className="text-sm font-medium truncate">{message}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="min-h-[36px] px-3 py-1 text-xs font-bold rounded-[var(--radius-pill)] bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
          >
            {action.label}
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] text-current p-1.5 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] rounded"
          >
            <Icon name="close" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
