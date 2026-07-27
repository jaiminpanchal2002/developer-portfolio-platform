"use client";

import { useEffect, useRef } from "react";

interface Props {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}

/** Checkbox with a comfortable click/tap target, used for both the header
 *  "select all" control and per-row selection in admin tables. */
export default function SelectCheckbox({ checked, indeterminate, onChange, label }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return (
    <label
      className="flex h-11 w-11 cursor-pointer items-center justify-center"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 cursor-pointer rounded border-[var(--noir-border-strong)] accent-[var(--noir-accent)]"
      />
    </label>
  );
}
