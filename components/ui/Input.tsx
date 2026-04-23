"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={fieldId}
            className="font-label text-xs uppercase tracking-wider text-secondary-600"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-err` : hint ? `${fieldId}-hint` : undefined
          }
          className={cn(
            "h-12 w-full rounded-xl bg-tertiary border border-secondary-200",
            "px-4 font-label text-[0.95rem] text-secondary-900 placeholder:text-secondary-400",
            "transition-colors duration-200 [transition-timing-function:var(--ease-out-strong)]",
            "focus:outline-none focus:border-secondary-700 focus:ring-2 focus:ring-secondary-900/10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="font-label text-xs text-secondary-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-err`} className="font-label text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
