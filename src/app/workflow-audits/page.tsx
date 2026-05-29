import Link from "next/link";
import { WorkflowAuditRunButton } from "@/components/workflow-audit-run-button";
import { ContentPageShell } from "@/components/content-page-shell";
import { isDatabaseConfigured, seedOperationalDatabase } from "@/lib/db-operational";
import { listWorkflowGapAudits } from "@/lib/workflow-audit";

export const dynamic = "force-dynamic";

export default async function WorkflowAuditsPage() {
  if (isDatabaseConfigured()) await seedOperationalDatabase();
  const audits = await listWorkflowGapAudits();

  return (
    <ContentPageShell
      eyebrow="Operations smoke alarm"
      title="Workflow Gap Audits"
      description="Weekly checks for stalled workflows, failed automations, stale approvals, import/export issues, and safety gaps."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <WorkflowAuditRunButton label="Run weekly audit" />
        <Link href="/workflow-gaps" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium">
          Gap queue
        </Link>
      </div>
      <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Audit date</th>
              <th className="px-4 py-3">Range</th>
              <th className="px-4 py-3">Readiness</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Gaps</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td className="px-4 py-3 font-mono text-xs">{audit.auditDate.toISOString().slice(0, 10)}</td>
                <td className="px-4 py-3">
                  {audit.dateRangeStart.toISOString().slice(0, 10)} to {audit.dateRangeEnd.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3">{audit.readinessLevel.toLowerCase()}</td>
                <td className="px-4 py-3 font-semibold">{audit.overallHealthScore}</td>
                <td className="px-4 py-3">
                  {audit.totalGaps} total / {audit.criticalCount} critical / {audit.highCount} high
                </td>
                <td className="px-4 py-3">{audit.status.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <Link href={`/workflow-audits/${audit.id}`} className="text-[#1e6b4d] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!audits.length ? (
              <tr>
                <td className="px-4 py-6 text-stone-600" colSpan={7}>
                  No workflow audits yet. Run the first audit to create persistent gap records.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </ContentPageShell>
  );
}
