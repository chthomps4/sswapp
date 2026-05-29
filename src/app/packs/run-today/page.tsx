import { ContentPackDetail } from "@/components/content-pack-detail";
import { ContentPageShell } from "@/components/content-page-shell";
import { getLatestContentPack, getPackForDisplay, isDatabaseConfigured } from "@/lib/db-operational";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RunTodayPackPage() {
  const pack = isDatabaseConfigured() ? await getLatestContentPack() : await getPackForDisplay();

  if (!pack) {
    return (
      <ContentPageShell
        eyebrow="Content pack"
        title="No Run Today pack yet"
        description="The production database is connected, but no persisted content pack exists yet."
      >
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-stone-900">Create the first persisted pack</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Run Today will create real ContentPack, PostDraft, ImagePrompt, Approval, and AutomationRun records. Nothing is
            approved or published automatically.
          </p>
          <Link
            href="/run-today"
            className="mt-4 inline-flex rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white hover:bg-[#195a41]"
          >
            Open Run Today
          </Link>
        </div>
      </ContentPageShell>
    );
  }

  return (
    <ContentPageShell
      eyebrow="Content pack"
      title={pack.contentPack.title}
      description="A review-ready Run Today pack detail view. Exports are available, but scheduler CSV includes approved posts only."
    >
      <ContentPackDetail pack={pack} />
    </ContentPageShell>
  );
}
