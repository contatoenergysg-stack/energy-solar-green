"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "inverted";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-secondary-900 hover:bg-primary-500 focus-visible:ring-secondary-700",
  secondary:
    "bg-secondary-800 text-tertiary hover:bg-secondary-900 focus-visible:ring-primary",
  outline:
    "border border-secondary-800 text-secondary-900 hover:bg-secondary-800 hover:text-tertiary focus-visible:ring-secondary-700",
  ghost:
    "text-secondary-900 hover:bg-secondary-900/5 focus-visible:ring-secondary-700",
  inverted:
    "bg-tertiary text-secondary-900 hover:bg-tertiary-soft focus-visible:ring-primary",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-label font-medium tracking-tight",
          "inline-flex items-center justify-center gap-2 rounded-full",
          "transition-[transform,background-color,color,border-color] duration-200",
          "[transition-timing-function:var(--ease-out-strong)]",
          "active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tertiary",
          "disabled:opacity-50 disabled:pointer-events-none",
          "whitespace-nowrap",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
