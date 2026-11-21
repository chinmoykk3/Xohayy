import React from "react";

export type ButtonVariant = "primary" | "emergency" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px] min-w-[48px] px-4 py-2 text-base rounded-[var(--radius-card)]";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--color-primary-bg)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary-hover)] active:opacity-90",
    emergency:
      "bg-[var(--color-emergency-bg)] text-[var(--color-emergency-text)] hover:bg-[var(--color-emergency-hover)] active:opacity-90 font-bold tracking-wide",
    secondary:
      "bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border-card)] hover:bg-[var(--color-bg-page)] active:opacity-90",
    ghost:
      "bg-transparent text-[var(--color-text-main)] hover:bg-[var(--color-border-card)]/20 active:opacity-90",
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: "text-sm px-3 min-h-[48px]",
    md: "text-base px-5 min-h-[48px]",
    lg: "text-lg px-6 min-h-[56px]",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2" aria-live="polite">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
