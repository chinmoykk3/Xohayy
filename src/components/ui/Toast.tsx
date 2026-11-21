"use client";

import React from "react";
import { Icon } from "./Icon";

export interface ToastProps {
  isOpen: boolean;
  message: string;
  type?: "info" | "success" | "alert";
  onClose?: () => void;
}

export function Toast({ isOpen, message, type = "info", onClose }: ToastProps) {
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
      <div className="flex items-center gap-2">
        <Icon
          name={type === "alert" ? "alert-triangle" : type === "success" ? "check" : "info"}
          size={22}
        />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] text-current p-2 hover:opacity-75"
        >
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  );
}
