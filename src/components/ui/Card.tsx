import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "article" | "section";
}

export function Card({ as: Component = "div", className = "", children, ...props }: CardProps) {
  return (
    <Component
      className={`bg-[var(--color-bg-card)] border border-[var(--color-border-card)] rounded-[var(--radius-card)] p-4 sm:p-6 shadow-xs ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
