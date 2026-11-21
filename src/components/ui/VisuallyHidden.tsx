import React from "react";

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: "span" | "div" | "p";
  className?: string;
}

export function VisuallyHidden({
  children,
  as: Component = "span",
  className = "",
}: VisuallyHiddenProps) {
  return (
    <Component
      className={`sr-only absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0 ${className}`}
    >
      {children}
    </Component>
  );
}
