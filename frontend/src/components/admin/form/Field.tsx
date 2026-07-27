"use client";

import { ReactNode } from "react";

interface Props {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Consistent label + input + inline error for every admin form field. */
export default function Field({ label, htmlFor, required, error, hint, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[var(--noir-fg-muted)]">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
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
