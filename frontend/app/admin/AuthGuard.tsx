"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

const emptySubscribe = () => () => {};

function readToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") return null;
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
