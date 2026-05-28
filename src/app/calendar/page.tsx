import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";
import { isDatabaseConfigured, listCalendarDrafts } from "@/lib/db-operational";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const dbDrafts = isDatabaseConfigured() ? await listCalendarDrafts() : null;
  const pack = dbDrafts ? null : createSampleDailyContentPack();
  const drafts =
    dbDrafts?.map((draft) => ({
      id: draft.id,
      date: draft.date.toISOString().slice(0, 10),
      brandName: draft.brand.name,
      platformName: draft.platform.name,
      contentPillarName: draft.contentPillar.name,
      hook: draft.hook,
      status: draft.status.toLowerCase(),
    })) || pack?.postDrafts || [];

  return (
    <ContentPageShell eyebrow="Calendar" title="Content Calendar" description="List view of generated posts by date, brand, platform, pillar, and status.">
      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Pillar</th>
              <th className="px-4 py-3">Hook</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {drafts.map((draft) => (
              <tr key={draft.id}>
                <td className="px-4 py-3 font-mono text-xs">{draft.date}</td>
                <td className="px-4 py-3">{draft.brandName}</td>
                <td className="px-4 py-3">{draft.platformName}</td>
                <td className="px-4 py-3">{draft.contentPillarName}</td>
                <td className="px-4 py-3">{draft.hook}</td>
                <td className="px-4 py-3">{draft.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ContentPageShell>
  );
}
