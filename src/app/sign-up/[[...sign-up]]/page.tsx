import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { getSetupStatus } from "@/lib/setup-status";

export default function SignUpPage() {
  const setup = getSetupStatus();

  if (!setup.clerkAuthAvailable) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-6">
        <div className="w-full max-w-md rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
          <p className="font-semibold">Clerk production readiness check required</p>
          <p className="mt-2 text-sm leading-6">
            Configure Clerk keys for a live auth environment before using sign-up.
          </p>
          <Link href="/setup-status" className="mt-3 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
            Open setup status
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-[#f5f7f4] p-4 sm:p-6 lg:items-center">
      <div className="grid w-full max-w-5xl gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <section className="order-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:order-1 lg:p-5">
          <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
          <h1 className="mt-2 text-xl font-semibold text-[#17211d] sm:text-2xl">Create the owner account</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600 lg:max-w-xl">
            Use one of the approved owner emails for this private dashboard. After verification, Clerk will return you to the app.
          </p>
          <div className="mt-4 rounded-md border border-[#b7d8ce] bg-[#eef8f4] p-3 text-sm text-[#17211d]">
            <p className="font-semibold">Use an approved owner email</p>
            <p className="mt-1 leading-5">
              The app will keep owner-only actions restricted to the private owner email list already configured in production.
            </p>
          </div>
          <Link href="/sign-in" className="mt-4 inline-flex text-sm font-semibold text-[#1e6b4d] hover:underline">
            Back to sign in
          </Link>
        </section>
        <div className="order-1 flex min-h-[220px] justify-center lg:order-2">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl="/"
            fallbackRedirectUrl="/"
            oauthFlow="redirect"
          />
        </div>
      </div>
    </main>
  );
}
