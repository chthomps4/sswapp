import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";

export default function ApprovalsPage() {
  const pack = createSampleDailyContentPack();
  return (
    <ContentPageShell eyebrow="Approval queue" title="Approval Queue" description="Copy, image prompt, asset, and full-post approval records. Approval remains required before export or manual publishing.">
      <div className="grid gap-3">
        {pack.approvals.slice(0, 12).map((approval) => (
          <div key={approval.id} className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">{approval.type}</p>
              <p className="text-xs text-stone-500">{approval.notes}</p>
            </div>
            <span className="w-fit rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs">{approval.status}</span>
          </div>
        ))}
      </div>
    </ContentPageShell>
  );
}
