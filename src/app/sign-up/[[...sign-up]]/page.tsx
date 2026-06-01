import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";
import { getSetupStatus } from "@/lib/setup-status";

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

export default function SignUpPage() {
  const clerk = getClerkRuntimeState();
  const setup = getSetupStatus();
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";
  const fallbackRedirect = localRedirectPath(
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    "/auth/complete",
  );

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f5f7f4] p-4 sm:p-6 lg:items-center">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="order-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:order-1 lg:p-5">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-xl font-semibold text-[#17211d] sm:text-2xl">Create the owner account</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 lg:max-w-xl">
            Use an approved owner email. After verification, Clerk returns you to the dashboard.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">Approved owner emails only</p>
            <p className="mt-1 leading-5">
              If the signed-in email is not in OWNER_EMAILS, the dashboard will authenticate but owner-only actions will
              be denied.
            </p>
          </div>
          <Link href="/sign-in" className="mt-4 inline-flex text-sm font-semibold text-[#1e6b4d] hover:underline">
            Back to sign in
          </Link>
        </section>
        <div className="order-1 flex min-h-[220px] justify-center lg:order-2">
          {!clerk.canRenderClerkClient ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <p className="font-semibold">Clerk production auth is not ready</p>
              <p className="mt-2 text-sm leading-6">
                Configure Clerk keys for a live auth environment before using sign-up.
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
              <SignUp
                path="/sign-up"
                routing="path"
                signInUrl={signInUrl}
                forceRedirectUrl={fallbackRedirect}
                fallbackRedirectUrl={fallbackRedirect}
                oauthFlow="redirect"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
