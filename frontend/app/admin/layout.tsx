"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import AuthGuard from "./AuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { pageTransition } from "@/lib/motion/adminMotion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    // Covers every admin page, modal, table, and sidebar animation from one
    // place: when the OS prefers-reduced-motion setting is on, Framer Motion
    // automatically drops transform/layout animation for every motion.*
    // descendant here while still allowing opacity to transition.
    <MotionConfig reducedMotion="user">
      <AuthGuard>
        <div className="min-h-screen bg-[var(--noir-bg)] text-[var(--noir-fg)]">
          <div className="flex">
            <AdminSidebar />

            <div className="flex-1 min-w-0">
              <AdminNavbar />

              <main className="p-4 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={pageTransition.initial}
                    animate={pageTransition.animate}
                    exit={pageTransition.exit}
                    transition={pageTransition.transition}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        </div>
      </AuthGuard>
    </MotionConfig>
  );
}