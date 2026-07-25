"use client";

export default function AdminNavbar() {
  return (
    <header
      className="
      sticky
      top-0
      z-50
      backdrop-blur-xl
      bg-[var(--noir-bg)]/70
      border-b
      border-white/10
      px-6
      py-4
      "
    >
      <div className="flex items-center justify-between pl-12 md:pl-0">

        <div>
          <h1 className="font-bold text-xl">
            Portfolio Admin
          </h1>

          <p className="text-sm text-[var(--noir-fg-muted)]">
            Manage your portfolio
          </p>
        </div>

        <div
          className="
          h-10
          w-10
          rounded-full
          bg-[var(--noir-accent)]
          flex
          items-center
          justify-center
          font-bold
          text-[var(--noir-bg)]
          "
        >
          A
        </div>

      </div>
    </header>
  );
}