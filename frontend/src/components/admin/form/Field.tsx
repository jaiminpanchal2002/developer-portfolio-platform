"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  /** When set alongside `maxLength`, renders a live "N / max" counter next to the label. */
  currentLength?: number;
  maxLength?: number;
}

/** Consistent label + input + inline error for every admin form field. */
export default function Field({ label, htmlFor, required, error, hint, children, currentLength, maxLength }: Props) {
  const nearLimit = maxLength !== undefined && currentLength !== undefined && currentLength >= maxLength * 0.9;
  const overLimit = maxLength !== undefined && currentLength !== undefined && currentLength > maxLength;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--noir-fg-muted)]">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {maxLength !== undefined && currentLength !== undefined && (
          <span
            className={cn(
              "text-xs font-mono tabular-nums shrink-0",
              overLimit ? "text-red-400" : nearLimit ? "text-yellow-400" : "text-[var(--noir-fg-subtle)]"
            )}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-[var(--noir-fg-subtle)]">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
