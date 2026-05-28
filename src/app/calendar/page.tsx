import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";

export default function CalendarPage() {
  const pack = createSampleDailyContentPack();
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
            {pack.postDrafts.map((draft) => (
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
