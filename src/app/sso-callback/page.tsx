import Link from "next/link";
import { SsoCallbackClient } from "@/components/sso-callback-client";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";

export default function SsoCallbackPage() {
  const clerk = getClerkRuntimeState();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-6 text-[#17211d]">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold">Finishing Google sign-in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          This page completes the secure Clerk OAuth callback and returns you to the dashboard.
        </p>
        {clerk.shouldUseClerkAuth ? (
          <SsoCallbackClient />
        ) : (
          <Link href="/setup-status" className="mt-4 inline-flex font-semibold text-[#1e6b4d] hover:underline">
            Open setup status
          </Link>
        )}
      </section>
    </main>
  );
}
