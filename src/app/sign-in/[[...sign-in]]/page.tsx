import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";
import { getSetupStatus } from "@/lib/setup-status";

type SignInPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

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

export default function SignInPage({ searchParams = {} }: SignInPageProps) {
  const setup = getSetupStatus();
  const clerk = getClerkRuntimeState();
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";
  const fallbackRedirect = localRedirectPath(
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    "/auth/complete",
  );

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
            The dashboard is private. For now, use the Vercel deployment URL for testing.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">First time signing in?</p>
            <p className="mt-1 leading-5">
              If Clerk cannot find your account, create the owner account first with one of the approved owner emails.
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
                  This usually means Clerk is still trying to use an old custom domain. Open the Vercel app URL and try
                  again after clearing the old site cookies.
                </p>
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
              <p className="font-semibold">Clerk production auth is not ready</p>
              <p className="mt-2 text-sm leading-6">
                Sign-in is unavailable until a valid Clerk publishable key is configured in Vercel.
              </p>
              <Link
                href="/setup-status"
                className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white"
              >
                Open setup status
              </Link>
            </div>
          ) : (
            <div className="w-full space-y-3">
              {!setup.clerkAuthAvailable ? (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  Clerk can render, but private routes stay locked until live server auth is confirmed in Vercel.
                </p>
              ) : null}
              <div className="flex min-h-[220px] justify-center">
                <SignIn
                  path="/sign-in"
                  routing="path"
                  signUpUrl={signUpUrl}
                  forceRedirectUrl={fallbackRedirect}
                  fallbackRedirectUrl={fallbackRedirect}
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
