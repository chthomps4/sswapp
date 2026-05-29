import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPageShell } from "@/components/content-page-shell";
import { WorkflowAuditRunButton } from "@/components/workflow-audit-run-button";
import { getWorkflowGapAudit } from "@/lib/workflow-audit";

export const dynamic = "force-dynamic";

export default async function WorkflowAuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getWorkflowGapAudit(id);
  if (!audit) notFound();

  const criticalHigh = audit.gaps.filter((gap) => ["CRITICAL", "HIGH"].includes(gap.severity));

  return (
    <ContentPageShell eyebrow="Workflow audit" title={`Audit ${audit.auditDate.toISOString().slice(0, 10)}`} description={audit.summary || "Weekly workflow gap audit detail."}>
      <div className="mb-4 flex flex-wrap gap-2">
        <WorkflowAuditRunButton label="Run again" />
        <a href={`/api/workflow-audits/${audit.id}/export`} className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium">
          Export Markdown
        </a>
        <Link href="/workflow-gaps" className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium">
          Gap queue
        </Link>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Readiness", audit.readinessLevel.toLowerCase()],
          ["Score", audit.overallHealthScore],
          ["Critical", audit.criticalCount],
          ["High", audit.highCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-stone-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="mt-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Checkpoint Results</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-3 py-2">Checkpoint</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Records</th>
                <th className="px-3 py-2">Gaps</th>
                <th className="px-3 py-2">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {audit.checkpoints.map((checkpoint) => (
                <tr key={checkpoint.id}>
                  <td className="px-3 py-2 font-medium">{checkpoint.checkpointName}</td>
                  <td className="px-3 py-2">{checkpoint.status.toLowerCase()}</td>
                  <td className="px-3 py-2">{checkpoint.recordsChecked}</td>
                  <td className="px-3 py-2">{checkpoint.gapsFound}</td>
                  <td className="px-3 py-2 text-stone-600">{checkpoint.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Critical and High Gaps</h2>
        <div className="mt-3 space-y-3">
          {criticalHigh.map((gap) => (
            <div key={gap.id} className="rounded-md border border-stone-200 p-3">
              <p className="text-xs font-semibold uppercase text-stone-500">{gap.severity.toLowerCase()} / {gap.category}</p>
              <p className="mt-1 font-medium">{gap.title}</p>
              <p className="mt-1 text-sm text-stone-600">{gap.description}</p>
              <p className="mt-2 text-sm text-[#1e6b4d]">{gap.recommendation}</p>
            </div>
          ))}
          {!criticalHigh.length ? <p className="text-sm text-stone-600">No critical or high gaps in this audit.</p> : null}
        </div>
      </section>
      <section className="mt-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Action Items</h2>
        <div className="mt-3 space-y-2">
          {audit.actionItems.map((item) => (
            <div key={item.id} className="rounded-md border border-stone-200 px-3 py-2 text-sm">
              <span className="font-medium">{item.title}</span>
              <span className="text-stone-500"> - {item.recommendedAction}</span>
            </div>
          ))}
        </div>
      </section>
    </ContentPageShell>
  );
}
