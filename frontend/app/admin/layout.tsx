"use client";

import AuthGuard from "./AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--noir-bg)] text-[var(--noir-fg)]">
        <div className="flex">
          <AdminSidebar />

          <div className="flex-1 min-w-0">
            <AdminNavbar />

            <main className="p-4 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}