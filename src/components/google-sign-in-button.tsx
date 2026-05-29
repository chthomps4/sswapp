"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useState } from "react";

export function GoogleSignInButton() {
  const { isLoaded, signIn } = useSignIn();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function continueWithGoogle() {
    setError("");

    if (!isLoaded || !signIn) {
      setError("Sign-in is still loading. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/auth/complete",
      });
    } catch {
      setIsSubmitting(false);
      setError("Google sign-in did not start. Refresh the page and try again.");
    }
  }

  return (
    <div className="w-full rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-stone-500">Secure owner access</p>
      <button
        type="button"
        onClick={continueWithGoogle}
        disabled={isSubmitting}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-[#17211d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#26332e] disabled:cursor-wait disabled:opacity-70"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#17211d]">
          G
        </span>
        {isSubmitting ? "Opening Google..." : "Continue with Google"}
      </button>
      <p className="mt-3 text-xs leading-5 text-stone-500">
        If the embedded Clerk box does not load, use this button. It uses the same Clerk Google OAuth flow.
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
