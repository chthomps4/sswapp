import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { getWorkflowGapAudit, workflowAuditReportMarkdown } from "@/lib/workflow-audit";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { id } = await context.params;
  const audit = await getWorkflowGapAudit(id);
  if (!audit) return NextResponse.json({ message: "Workflow audit not found." }, { status: 404 });
  const date = audit.auditDate.toISOString().slice(0, 10);
  return new NextResponse(workflowAuditReportMarkdown(audit), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="weekly-workflow-gap-audit-${date}.md"`,
    },
  });
}
