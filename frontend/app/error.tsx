"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-[var(--noir-accent)] via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
        Something went wrong
      </h1>
      <p className="text-[var(--noir-fg-muted)] max-w-md text-sm md:text-base">
        The portfolio couldn&apos;t load right now. This is usually temporary — try again in a moment.
      </p>
      <button
        onClick={reset}
        className="mt-4 px-6 py-3 rounded-2xl bg-[var(--noir-accent)] hover:bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[var(--noir-accent)]/20 cursor-pointer"
      >
        Try again
      </button>
    </div>
  );
}
