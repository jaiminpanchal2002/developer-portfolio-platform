import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-[var(--noir-accent)] via-blue-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
        404
      </h1>
      <p className="text-[var(--noir-fg-muted)] max-w-md text-sm md:text-base">
        This page doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <Link
        href="/"
        className="mt-4 px-6 py-3 rounded-2xl bg-[var(--noir-accent)] hover:bg-[var(--noir-accent)] text-[var(--noir-bg)] font-bold transition duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-[var(--noir-accent)]/20"
      >
        Back to Home
      </Link>
    </div>
  );
}
