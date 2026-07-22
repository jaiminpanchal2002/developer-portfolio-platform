"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

/**
 * Fire-and-forget page-view beacon. Reports each public route change to
 * the backend; sends no cookies and never tracks admin/auth pages.
 * Failures are swallowed — analytics must never affect the visitor.
 */
export default function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      return;
    }
    api
      .post("/public/track", {
        path: pathname,
        referrer: document.referrer || "",
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
