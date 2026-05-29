"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export function SsoCallbackClient() {
  return (
    <AuthenticateWithRedirectCallback
      signInFallbackRedirectUrl="/auth/complete"
      signUpFallbackRedirectUrl="/auth/complete"
    />
  );
}
