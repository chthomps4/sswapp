import { NextResponse } from "next/server";
import { getFacebookRuntimeState } from "@/lib/facebook-runtime";
import { getSetupStatus } from "@/lib/setup-status";

export async function GET() {
  const setup = getSetupStatus();
  const facebook = getFacebookRuntimeState();

  return NextResponse.json({
    ok: true,
    app: "sswapp",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    dashboardAuthMode: setup.dashboardAuthMode,
    dashboardAuthDisabled: setup.dashboardAuthDisabled,
    clerkConfigured: setup.clerkConfigured,
    clerkKeyMode: setup.clerkKeyMode,
    clerkAuthDisabled: setup.clerkAuthDisabled,
    clerkAuthMode: setup.clerkAuthMode,
    clerkProductionReady: setup.clerkProductionReady,
    clerkAuthAvailable: setup.clerkAuthAvailable,
    ownerEmailsConfigured: Boolean(process.env.OWNER_EMAILS),
    aiContentEnabled: process.env.ENABLE_AI_CONTENT_GENERATION === "true",
    aiMetricAnalysisEnabled: process.env.ENABLE_AI_METRIC_ANALYSIS === "true",
    facebookSdkConfigured: facebook.sdkConfigured,
    facebookPublishingEnabled: facebook.publishingEnabled,
    facebookPublishingConfigured: facebook.publishingConfigured,
    setupReady: setup.ready,
    blockerCount: setup.blockers.length,
  });
}
