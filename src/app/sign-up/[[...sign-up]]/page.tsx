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
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-6">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/" />
    </main>
  );
}
