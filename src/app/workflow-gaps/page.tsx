import Link from "next/link";
import { ContentPageShell } from "@/components/content-page-shell";
import { WorkflowGapActions } from "@/components/workflow-gap-actions";
import { listWorkflowGaps } from "@/lib/workflow-audit";

export const dynamic = "force-dynamic";

export default async function WorkflowGapsPage() {
  const gaps = await listWorkflowGaps();

  return (
    <ContentPageShell
      eyebrow="Operations queue"
      title="Workflow Gaps"
      description="Review, accept, ignore, or resolve gaps found by the weekly workflow audit."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/workflow-audits" className="rounded-md bg-[#1e6b4d] px-4 py-2 text-sm font-medium text-white">
          Workflow audits
        </Link>
      </div>
      <section className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Gap</th>
              <th className="px-4 py-3">Affected</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {gaps.map((gap) => (
              <tr key={gap.id} className="align-top">
                <td className="px-4 py-3 font-semibold">{gap.severity.toLowerCase()}</td>
                <td className="px-4 py-3">{gap.category}</td>
                <td className="max-w-md px-4 py-3">
                  <p className="font-medium">{gap.title}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-600">{gap.description}</p>
                  <p className="mt-2 text-xs text-[#1e6b4d]">{gap.recommendation}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {gap.affectedBrand?.name || gap.affectedPlatform?.name || gap.affectedEntityType || "System"}
                  {gap.affectedEntityId ? <span className="block font-mono text-stone-500">{gap.affectedEntityId.slice(0, 16)}</span> : null}
                </td>
                <td className="px-4 py-3">{gap.status.toLowerCase()}</td>
                <td className="px-4 py-3">
                  <WorkflowGapActions gapId={gap.id} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/workflow-audits/${gap.auditId}`} className="text-[#1e6b4d] hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!gaps.length ? (
              <tr>
                <td className="px-4 py-6 text-stone-600" colSpan={7}>
                  No workflow gaps yet. Run a weekly audit to populate this queue.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </ContentPageShell>
  );
}
