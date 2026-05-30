"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthCompleteClient() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (userId) router.replace("/");
  }, [isLoaded, router, userId]);

  return (
    <div className="mt-4 space-y-3 text-sm text-stone-600">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {isLoaded ? "Session check complete" : "Loading secure session"}
      </p>
      {isLoaded && !userId ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-left text-amber-950">
          <p className="font-semibold">No signed-in session was found yet.</p>
          <p className="mt-1 leading-5">
            Return to sign in or sign up instead of bouncing between auth pages.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/sign-in" className="rounded-md bg-[#1e6b4d] px-3 py-2 text-xs font-medium text-white">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-md border border-amber-300 px-3 py-2 text-xs font-medium text-amber-950">
              Sign up
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
