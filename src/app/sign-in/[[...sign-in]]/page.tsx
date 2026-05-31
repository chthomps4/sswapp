import { SignIn } from "@clerk/nextjs";
import { headers } from "next/headers";
import Link from "next/link";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";
import { getSetupStatus } from "@/lib/setup-status";

type SignInPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

async function getCurrentOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) return "";
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

async function getCanonicalAuthOrigin(clerkCanonicalHost: string, currentOrigin: string) {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (currentOrigin) {
    return currentOrigin;
  }
  if (configuredAppUrl) {
    return configuredAppUrl.startsWith("http") ? configuredAppUrl : `https://${configuredAppUrl}`;
  }
  if (clerkCanonicalHost) {
    const trimmed = clerkCanonicalHost.trim().replace(/^https?:\/\//i, "");
    return trimmed ? `https://${trimmed}` : "";
  }
  return currentOrigin;
}

async function resolveRedirectUrl(candidate: string, originOverride: string) {
  const origin = originOverride || (await getCurrentOrigin());
  if (!candidate) return "";
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return origin ? new URL(candidate.startsWith("/") ? candidate : `/${candidate}`, origin).toString() : candidate;
}

export default async function SignInPage({ searchParams = {} }: SignInPageProps) {
  const setup = getSetupStatus();
  const clerk = getClerkRuntimeState();
  const currentOrigin = await getCurrentOrigin();
  const canonicalAuthOrigin = await getCanonicalAuthOrigin(clerk.canonicalHost, currentOrigin);
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  const fallbackRedirect =
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || "/auth/complete";
  const resolvedFallbackRedirect = await resolveRedirectUrl(fallbackRedirect, canonicalAuthOrigin);
  const currentOriginAllowed = currentOrigin
    ? clerk.allowedRedirectOrigins.some(
        (origin) => origin.replace(/\/+$/, "") === currentOrigin.replace(/\/+$/, ""),
      )
    : false;

  const rawError =
    typeof searchParams.error === "string"
      ? searchParams.error
      : typeof searchParams.error_description === "string"
        ? searchParams.error_description
        : "";
  const errorMessage = rawError ? decodeURIComponent(rawError) : "";
  const looksLikeHostInvalid = /host invalid/i.test(errorMessage) || /invalid host/i.test(errorMessage);

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f5f7f4] p-4 sm:p-6 lg:items-center">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="order-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:order-1 lg:p-5">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-xl font-semibold text-[#17211d] sm:text-2xl">Sign in to continue</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 lg:max-w-xl">
            The dashboard is private. If sign-in looks blocked in production, check setup status first.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">First time signing in?</p>
            <p className="mt-1 leading-5">
              If Clerk says it cannot find your account, create the owner account first with one of the approved owner
              emails.
            </p>
            <Link href={signUpUrl} className="mt-2 inline-flex font-semibold text-[#1e6b4d] hover:underline">
              Create owner account
            </Link>
          </div>
          {errorMessage ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <p className="font-semibold">Sign-in callback issue</p>
              <p className="mt-1 leading-5">{errorMessage}</p>
              {looksLikeHostInvalid ? (
                <p className="mt-2 text-xs leading-5">
                  If this is a host mismatch, open the sign-in URL at your current
                  <span className="font-semibold"> {process.env.NEXT_PUBLIC_APP_URL || "dashboard domain"}</span>, refresh,
                  then clear Clerk/Google cookies.
                  Your Clerk OAuth callback may still reference an old domain.
                </p>
              ) : null}
              {!currentOriginAllowed ? (
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950 text-xs">
                  <p className="font-semibold">Current host is not in allowed Clerk redirect list.</p>
                  <p className="mt-1">
                    Current host:
                    <span className="font-mono mx-1 break-all">{currentOrigin || "unknown"}</span>
                  </p>
                  <p className="mt-1 break-all">
                    Allowed redirects:{" "}
                    <span className="font-mono">
                      {clerk.allowedRedirectOrigins.length ? clerk.allowedRedirectOrigins.join(", ") : "none"}
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          {!setup.ready ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <p className="font-semibold">Setup needs attention</p>
              <p className="mt-1">
                {setup.blockers.length} production blocker{setup.blockers.length === 1 ? "" : "s"} detected.
              </p>
              <Link href="/setup-status" className="mt-2 inline-flex font-semibold text-[#1e6b4d] hover:underline">
                Open setup status
              </Link>
            </div>
          ) : null}
        </section>
        <div className="order-1 grid gap-3 lg:order-2">
          {!clerk.canRenderClerkClient ? (
            <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
              <p className="font-semibold">Clerk production readiness check required</p>
              <p className="mt-2 text-sm leading-6">
                Configure Clerk publishable + secret keys for a full production auth flow.
              </p>
              <Link href="/setup-status" className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
                Open setup status
              </Link>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {!setup.clerkAuthAvailable ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-semibold">Authentication is not in final production mode</p>
                  <p className="mt-1">
                    Sign-in is rendering, but protected private routes are still blocked until Clerk is in production-ready
                    state.
                  </p>
                  <p className="mt-1 text-xs">
                    This is usually a missing <code className="rounded bg-black/5 px-1 py-0.5">CLERK_SECRET_KEY</code> or
                    an environment mismatch in Vercel.
                  </p>
                </div>
              ) : null}
              <div className="flex min-h-[220px] justify-center">
                <SignIn
                  path="/sign-in"
                  routing="path"
                  signUpUrl={signUpUrl}
                  forceRedirectUrl={resolvedFallbackRedirect}
                  fallbackRedirectUrl={resolvedFallbackRedirect}
                  oauthFlow="redirect"
                  transferable={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
