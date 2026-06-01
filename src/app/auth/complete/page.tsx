import { AuthCompleteClient } from "@/components/auth-complete-client";
import { getClerkRuntimeState } from "@/lib/clerk-runtime";
import Link from "next/link";

type AuthCompletePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AuthCompletePage({ searchParams = {} }: AuthCompletePageProps) {
  const clerk = getClerkRuntimeState();
  const rawError =
    typeof searchParams.error === "string"
      ? searchParams.error
      : typeof searchParams.error_description === "string"
        ? searchParams.error_description
        : "";
  const hasError = Boolean(rawError);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-6 text-[#17211d]">
      <section className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase text-stone-500">Signal Workshop private dashboard</p>
        <h1 className="mt-2 text-2xl font-semibold">Completing sign-in</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Hold tight while the dashboard finishes the secure sign-in handoff.
        </p>
        {clerk.canRenderClerkClient ? <AuthCompleteClient /> : null}
        {!clerk.canRenderClerkClient ? (
          <>
            {hasError ? (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-left text-xs leading-5 text-amber-950">
                Clerk callback returned:
                <span className="ml-1 break-all font-mono">{rawError}</span>
              </p>
            ) : null}
            {rawError ? (
              /host invalid/i.test(String(rawError)) || /host_invalid/i.test(String(rawError)) ? (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-left text-xs leading-5 text-amber-950">
                  Clerk is rejecting this host.
                  <span className="font-semibold"> Confirm Clerk allowed domains include the current host</span> and
                  retry login.
                </p>
              ) : null
            ) : null}
            <Link
              href="/setup-status"
              className="mt-4 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white"
            >
              Open setup status
            </Link>
            {rawError ? (
              <Link
                href="/sign-in"
                className="mt-2 ml-2 inline-flex rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-900"
              >
                Back to sign in
              </Link>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
