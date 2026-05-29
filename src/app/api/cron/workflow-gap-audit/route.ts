import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db-operational";
import { redactSensitive, runWeeklyWorkflowGapAudit } from "@/lib/workflow-audit";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

async function runCron(request: Request) {
  if (!authorized(request)) return NextResponse.json({ ok: false, message: "Unauthorized cron request." }, { status: 401 });
  if (process.env.ENABLE_WEEKLY_WORKFLOW_GAP_AUDIT !== "true" || process.env.WEEKLY_WORKFLOW_AUDIT_CRON_ENABLED !== "true") {
    return NextResponse.json({ ok: false, message: "Weekly workflow gap audit cron is disabled." }, { status: 409 });
  }
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: false, message: "DATABASE_URL is required." }, { status: 503 });

  try {
    const result = await runWeeklyWorkflowGapAudit({ triggerType: "cron" });
    return NextResponse.json({
      ok: true,
      auditId: result.audit?.id || "",
      readinessLevel: result.score.readinessLevel.toLowerCase(),
      overallHealthScore: result.score.overallHealthScore,
      totalGaps: result.score.totalGaps,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: redactSensitive(error instanceof Error ? error.message : "Cron workflow audit failed.") }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return runCron(request);
}

export async function POST(request: Request) {
  return runCron(request);
}
