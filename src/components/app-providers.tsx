import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";

function toAbsoluteOrigin(urlString: string) {
  const canonicalHost = urlString.trim().replace(/^https?:\/\//i, "");
  return canonicalHost ? `https://${canonicalHost}` : "";
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) {
    return "";
  }

  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

function resolveRedirectTarget(rawTarget: string, currentOrigin: string) {
  if (!rawTarget) return "";
  if (/^https?:\/\//i.test(rawTarget)) return rawTarget;
  if (!currentOrigin) return rawTarget;
  const path = rawTarget.startsWith("/") ? rawTarget : `/${rawTarget}`;
  return new URL(path, currentOrigin).toString();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export async function AppProviders({ children }: { children: React.ReactNode }) {
  const clerk = getClerkRuntimeState();
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  const signInForceRedirectUrl =
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/auth/complete";
  const signUpForceRedirectUrl =
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/auth/complete";
  const currentOrigin = await getRequestOrigin();
  const canonicalOrigin = toAbsoluteOrigin(clerk.canonicalHost || "");
  const configuredAppOrigin = (process.env.NEXT_PUBLIC_APP_URL || "").trim();
  const allowCanonicalOrAppOrigin = configuredAppOrigin || canonicalOrigin || currentOrigin;
  const redirectOrigin = /https?:\/\//i.test(allowCanonicalOrAppOrigin) ? allowCanonicalOrAppOrigin : currentOrigin;
  const signInForceRedirect = resolveRedirectTarget(signInForceRedirectUrl, redirectOrigin);
  const signUpForceRedirect = resolveRedirectTarget(signUpForceRedirectUrl, redirectOrigin);
  const includeKnownHostnames = [configuredAppOrigin, canonicalOrigin, currentOrigin].filter(Boolean);
  const includeCanonicalOrHostnames = includeKnownHostnames
    .map((origin) => (origin && /^https?:\/\//i.test(origin) ? origin : toAbsoluteOrigin(origin || "")))
    .filter(Boolean);
  const allowedRedirectOrigins = unique([...clerk.allowedRedirectOrigins, ...includeCanonicalOrHostnames]);
  const publishableKey = clerk.publishableKey || process.env.CLERK_PUBLISHABLE_KEY || "";

  if (!clerk.canRenderClerkClient) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      domain={clerk.domain || undefined}
      allowedRedirectOrigins={allowedRedirectOrigins}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInForceRedirectUrl={signInForceRedirect}
      signUpForceRedirectUrl={signUpForceRedirect}
      signInFallbackRedirectUrl={signInForceRedirect}
      signUpFallbackRedirectUrl={signUpForceRedirect}
    >
      {children}
    </ClerkProvider>
  );
}
