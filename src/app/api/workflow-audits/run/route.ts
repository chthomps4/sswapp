import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db-operational";
import { redactSensitive, runWeeklyWorkflowGapAudit } from "@/lib/workflow-audit";

export async function POST(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ message: "DATABASE_URL is required to run workflow gap audits." }, { status: 503 });
  }

  try {
    const input = await request.json().catch(() => ({}));
    const result = await runWeeklyWorkflowGapAudit({
      dateRangeStart: input.dateRangeStart,
      dateRangeEnd: input.dateRangeEnd,
      includeAiSummary: Boolean(input.includeAiSummary),
      includeArchived: Boolean(input.includeArchived),
      dryRun: Boolean(input.dryRun),
      triggerType: "manual",
    });
    return NextResponse.json({
      ok: true,
      dryRun: result.dryRun,
      auditId: result.audit?.id || "",
      readinessLevel: result.score.readinessLevel.toLowerCase(),
      overallHealthScore: result.score.overallHealthScore,
      totalGaps: result.score.totalGaps,
      summary: result.summary,
    });
  } catch (error) {
    return NextResponse.json({ message: redactSensitive(error instanceof Error ? error.message : "Unable to run workflow gap audit.") }, { status: 500 });
  }
}
