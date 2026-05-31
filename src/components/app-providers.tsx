import { ClerkProvider } from "@clerk/nextjs";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const clerk = getClerkRuntimeState();

  if (!clerk.shouldUseClerkAuth) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      domain={clerk.domain || undefined}
      proxyUrl="/__clerk"
      allowedRedirectOrigins={clerk.allowedRedirectOrigins}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInForceRedirectUrl="/auth/complete"
      signUpForceRedirectUrl="/auth/complete"
      signInFallbackRedirectUrl="/auth/complete"
      signUpFallbackRedirectUrl="/auth/complete"
    >
      {children}
    </ClerkProvider>
  );
}
