import Link from "next/link";
import { CheckCircle2, CircleAlert, LockKeyhole, ShieldCheck } from "lucide-react";
import { getSetupStatus } from "@/lib/setup-status";

export const dynamic = "force-dynamic";

export default function SetupStatusPage() {
  const setup = getSetupStatus();

  return (
    <main className="min-h-screen bg-[#f5f7f4] px-4 py-6 text-[#17211d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/sign-in" className="text-sm font-medium text-[#1e6b4d] hover:underline">
          Go to sign in
        </Link>
        <header className="mt-5 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">Private dashboard setup</p>
              <h1 className="mt-2 text-2xl font-semibold">Setup Status</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Safe production-readiness checks for the Signal Workshop dashboard. This page does not expose secrets or private records.
              </p>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                setup.ready ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950"
              }`}
            >
              {setup.ready ? <ShieldCheck size={16} /> : <CircleAlert size={16} />}
              {setup.ready ? "Ready" : `${setup.blockers.length} blocker${setup.blockers.length === 1 ? "" : "s"}`}
            </span>
          </div>
        </header>

        {!setup.ready ? (
          <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <LockKeyhole size={18} />
              What needs your action
            </h2>
            <div className="mt-3 grid gap-2">
              {setup.blockers.map((item) => (
                <div key={item.key} className="rounded-md border border-amber-200 bg-white/70 p-3">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm">{item.action}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-4 grid gap-3">
          {setup.items.map((item) => (
            <article key={item.key} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">{item.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.action}</p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
                    item.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-950"
                  }`}
                >
                  {item.ok ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}
                  {item.value}
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
