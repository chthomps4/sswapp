"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthCompleteClient() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (userId) {
      router.replace("/");
      return;
    }

    const timeout = window.setTimeout(() => {
      router.replace("/sign-in");
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, router, userId]);

  return (
    <p className="mt-4 text-xs font-medium uppercase tracking-wide text-stone-500">
      {isLoaded ? "Checking session" : "Loading secure session"}
    </p>
  );
}
