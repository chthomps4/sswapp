import { AuthCompleteClient } from "@/components/auth-complete-client";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";

export default function AuthCompletePage() {
  const clerk = getClerkRuntimeState();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-6 text-[#17211d]">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold">Completing sign-in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Hold tight while the dashboard finishes the secure sign-in handoff.
        </p>
        {clerk.shouldUseClerkAuth ? (
          <AuthCompleteClient />
        ) : (
          <a href="/setup-status" className="mt-4 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
            Open setup status
          </a>
        )}
      </section>
    </main>
  );
}
