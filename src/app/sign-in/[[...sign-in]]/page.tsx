import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export default function SignInPage() {
  const setup = getSetupStatus();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-6">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#17211d]">Sign in to continue</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            The dashboard is private. If sign-in looks blocked in production, check setup status first.
          </p>
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
        <div className="flex justify-center">
          {setup.clerkKeyMode === "missing" ? (
            <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
              <p className="font-semibold">Clerk keys are missing</p>
              <p className="mt-2 text-sm leading-6">
                Add Clerk keys to the environment before rendering the sign-in form. The setup status page lists the exact blocker.
              </p>
              <Link href="/setup-status" className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
                Open setup status
              </Link>
            </div>
          ) : (
            <SignIn />
          )}
        </div>
      </div>
    </main>
  );
}
