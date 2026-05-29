import { NextResponse } from "next/server";
import { getSetupStatus } from "@/lib/setup-status";

export async function GET() {
  const setup = getSetupStatus();
  const clerkConfigured = setup.clerkKeyMode !== "missing";

  return NextResponse.json({
    ok: true,
    app: "sswapp",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    clerkConfigured,
    clerkKeyMode: setup.clerkKeyMode,
    clerkProductionReady: setup.clerkKeyMode === "live",
    ownerEmailsConfigured: Boolean(process.env.OWNER_EMAILS),
    aiContentEnabled: process.env.ENABLE_AI_CONTENT_GENERATION === "true",
    aiMetricAnalysisEnabled: process.env.ENABLE_AI_METRIC_ANALYSIS === "true",
    setupReady: setup.ready,
    blockerCount: setup.blockers.length,
  });
}
