import { ContentPageShell } from "@/components/content-page-shell";
import { createSampleDailyContentPack } from "@/lib/automation-engine";
import { isDatabaseConfigured, listApprovalQueue } from "@/lib/db-operational";

export const dynamic = "force-dynamic";

async function getApprovalQueueSafely() {
  if (!isDatabaseConfigured()) {
    return { approvals: null, warning: "Database is not configured; showing deterministic sample approvals.", allowSample: true };
  }
  try {
    return { approvals: await listApprovalQueue(), warning: "", allowSample: false };
  } catch {
    return {
      approvals: [],
      warning: "Approval records are unavailable in this deployment. Sample approvals are disabled for production data views.",
      allowSample: false,
    };
  }
}

export default async function ApprovalsPage() {
  const { approvals: dbApprovals, warning, allowSample } = await getApprovalQueueSafely();
  const pack = allowSample ? createSampleDailyContentPack() : null;
  const approvals =
    dbApprovals?.map((approval) => ({
      id: approval.id,
      type: approval.type.toLowerCase(),
      notes: approval.notes || `${approval.postDraft?.brand.name || "Brand"} / ${approval.postDraft?.platform.name || "platform"}`,
      status: approval.status.toLowerCase(),
    })) || pack?.approvals.slice(0, 12) || [];

  return (
    <ContentPageShell eyebrow="Approval queue" title="Approval Queue" description="Copy, image prompt, asset, and full-post approval records. Approval remains required before export or manual publishing.">
      {warning ? <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">{warning}</p> : null}
      <div className="grid gap-3">
        {approvals.length ? approvals.map((approval) => (
          <div key={approval.id} className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">{approval.type}</p>
              <p className="text-xs text-stone-500">{approval.notes}</p>
            </div>
            <span className="w-fit rounded border border-stone-200 bg-stone-50 px-2 py-1 text-xs">{approval.status}</span>
          </div>
        )) : (
          <div className="rounded-lg border border-stone-200 bg-white p-5 text-sm text-stone-600 shadow-sm">
            No persisted approvals found yet. Generated content and image prompts will create pending approval records.
          </div>
        )}
      </div>
    </ContentPageShell>
  );
}
