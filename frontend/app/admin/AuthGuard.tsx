"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const emptySubscribe = () => () => {};

function isExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" && decoded.exp * 1000 <= Date.now();
  } catch {
    // Malformed token — treat as expired rather than trusting it.
    return true;
  }
}

function readToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
  if (isExpired(token)) return null;
  return token;
}

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Server snapshot is null so nothing protected ever renders during SSR;
  // the client snapshot re-evaluates after hydration.
  const token = useSyncExternalStore(emptySubscribe, readToken, () => null);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
