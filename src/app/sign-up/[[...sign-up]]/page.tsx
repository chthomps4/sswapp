import { SignUp } from "@clerk/nextjs";
import { headers } from "next/headers";
import Link from "next/link";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";
import { getSetupStatus } from "@/lib/setup-status";

async function getCurrentOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  if (!host) return "";
  const protocol = requestHeaders.get("x-forwarded-proto") || "https";
  return `${protocol}://${host}`;
}

async function resolveRedirectUrl(candidate: string, originOverride: string) {
  if (!candidate) return "";
  if (/^https?:\/\//i.test(candidate)) return candidate;
  const origin = originOverride || (await getCurrentOrigin());
  return origin ? new URL(candidate.startsWith("/") ? candidate : `/${candidate}`, origin).toString() : candidate;
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

export default async function SignUpPage() {
  const clerk = getClerkRuntimeState();
  const currentOrigin = await getCurrentOrigin();
  const canonicalAuthOrigin = await getCanonicalAuthOrigin(clerk.canonicalHost, currentOrigin);
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
  const fallbackRedirect = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || "/auth/complete";
  const setup = getSetupStatus();
  const resolvedFallbackRedirect = await resolveRedirectUrl(fallbackRedirect, canonicalAuthOrigin);

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f5f7f4] p-4 sm:p-6 lg:items-center">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="order-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:order-1 lg:p-5">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-xl font-semibold text-[#17211d] sm:text-2xl">Create the owner account</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 lg:max-w-xl">
            Use one of the approved owner emails for this private dashboard. After verification, Clerk returns you to the app.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">Use an approved owner email</p>
            <p className="mt-1 leading-5">
              If your account does not use an owner email in OWNER_EMAILS, access will be denied after sign-up/login.
            </p>
          </div>
          <Link href="/sign-in" className="mt-4 inline-flex text-sm font-semibold text-[#1e6b4d] hover:underline">
            Back to sign in
          </Link>
        </section>
        <div className="order-1 flex min-h-[220px] justify-center lg:order-2">
          {!clerk.canRenderClerkClient ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <p className="font-semibold">Clerk production readiness check required</p>
              <p className="mt-2 text-sm leading-6">
                Configure Clerk keys for a live auth environment before using sign-up.
              </p>
            </div>
          ) : setup.clerkAuthAvailable ? (
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl={signInUrl}
              forceRedirectUrl={resolvedFallbackRedirect}
              fallbackRedirectUrl={resolvedFallbackRedirect}
              oauthFlow="redirect"
            />
          ) : (
            <div className="space-y-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <p className="font-semibold">Authentication is not in final production mode</p>
              <p className="mt-1 text-sm leading-5">
                Sign-up is visible, but protected private routes remain blocked until Clerk is complete in Vercel.
              </p>
              <p className="text-xs">
                This is usually a missing <code className="rounded bg-black/5 px-1 py-0.5">CLERK_SECRET_KEY</code> or owner
                access env mismatch.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
