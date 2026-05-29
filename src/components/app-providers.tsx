import { ClerkProvider } from "@clerk/nextjs";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const clerk = getClerkRuntimeState();

  if (!clerk.shouldUseClerkAuth) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      proxyUrl="/__clerk"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/auth/complete"
      signUpFallbackRedirectUrl="/auth/complete"
    >
      {children}
    </ClerkProvider>
  );
}
