import { ClerkProvider } from "@clerk/nextjs";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";

function localRedirectPath(rawValue: string | undefined, fallback: string) {
  const value = (rawValue || "").trim();
  if (!value) return fallback;
  if (value.startsWith("/")) return value;

  try {
    const parsed = new URL(value);
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const clerk = getClerkRuntimeState();
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  const signInRedirect = localRedirectPath(
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    "/auth/complete",
  );
  const signUpRedirect = localRedirectPath(
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    "/auth/complete",
  );

  if (!clerk.canRenderClerkClient) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={clerk.publishableKey}
      domain={clerk.domain || undefined}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInForceRedirectUrl={signInRedirect}
      signUpForceRedirectUrl={signUpRedirect}
      signInFallbackRedirectUrl={signInRedirect}
      signUpFallbackRedirectUrl={signUpRedirect}
    >
      {children}
    </ClerkProvider>
  );
}
