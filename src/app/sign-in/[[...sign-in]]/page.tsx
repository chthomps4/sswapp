import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export default function SignInPage() {
  const setup = getSetupStatus();

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
              If Clerk says it cannot find your account, create the owner account first with one of the approved owner emails.
            </p>
            <Link href="/sign-up" className="mt-2 inline-flex font-semibold text-[#1e6b4d] hover:underline">
              Create owner account
            </Link>
          </div>
          {!setup.ready ? (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
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
          {!setup.clerkAuthAvailable ? (
            <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
              <p className="font-semibold">Clerk production readiness check required</p>
              <p className="mt-2 text-sm leading-6">
                Use a compatible Clerk production configuration before rendering the sign-in form. The setup status page lists the exact blocker.
              </p>
              <Link href="/setup-status" className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
                Open setup status
              </Link>
            </div>
          ) : (
            <div className="flex min-h-[220px] justify-center">
              <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                forceRedirectUrl="/auth/complete"
                fallbackRedirectUrl="/auth/complete"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
