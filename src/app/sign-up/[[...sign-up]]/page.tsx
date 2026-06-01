import Link from "next/link";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f5f7f4] p-4 sm:p-6 lg:items-center">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="order-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:order-1 lg:p-5">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-xl font-semibold text-[#17211d] sm:text-2xl">Sign-up is temporarily disabled</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 lg:max-w-xl">
            Clerk has been removed from this dashboard build while we recover testing access. You can open the dashboard
            directly from the Vercel app URL.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">Temporary open testing mode</p>
            <p className="mt-1 leading-5">
              Do not use this as a private production deployment until owner auth is restored.
            </p>
          </div>
          <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-[#1e6b4d] hover:underline">
            Open dashboard
          </Link>
        </section>
        <div className="order-1 flex min-h-[220px] justify-center lg:order-2">
          <div className="w-full rounded-lg border border-[#b7d8ce] bg-[#eef8f4] p-5 text-[#17211d] shadow-sm">
            <p className="font-semibold">No account creation needed</p>
            <p className="mt-2 text-sm leading-6">
              This route stays as a clear landing page so old sign-up links do not bounce or hang.
            </p>
            <Link href="/" className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
              Open dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
