import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export default function SignInPage() {
  const setup = getSetupStatus();

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f5f7f4] p-4 sm:p-6 lg:items-center">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="order-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:order-1 lg:p-5">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-xl font-semibold text-[#17211d] sm:text-2xl">Dashboard access is open for testing</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 lg:max-w-xl">
            Clerk has been removed from this deployment path so you can get into the dashboard and test the operating
            system. Use the Vercel app URL while auth is rebuilt.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">Temporary safety note</p>
            <p className="mt-1 leading-5">
              This is intentionally open for recovery and testing. Do not treat this deployment as private production
              until owner auth is restored.
            </p>
            <Link href="/" className="mt-2 inline-flex font-semibold text-[#1e6b4d] hover:underline">
              Open dashboard
            </Link>
          </div>
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
          <div className="w-full rounded-lg border border-[#b7d8ce] bg-[#eef8f4] p-5 text-[#17211d] shadow-sm">
            <p className="font-semibold">No sign-in box is required right now</p>
            <p className="mt-2 text-sm leading-6">
              The dashboard is unlocked on this build so the team can test content, approvals, imports, exports, and
              calendar pages without the Clerk callback loop.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/" className="rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
                Open dashboard
              </Link>
              <Link
                href="/setup-status"
                className="rounded-md border border-[#b7d8ce] bg-white px-4 py-2 text-sm font-medium text-[#17211d]"
              >
                Setup status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
