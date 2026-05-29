import { NextResponse } from "next/server";

export async function GET() {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkSecretKey = process.env.CLERK_SECRET_KEY || "";
  const clerkConfigured = Boolean(clerkPublishableKey && clerkSecretKey);
  const clerkKeyMode =
    !clerkConfigured ? "missing" : clerkPublishableKey.startsWith("pk_live_") && clerkSecretKey.startsWith("sk_live_") ? "live" : "development";

  return NextResponse.json({
    ok: true,
    app: "sswapp",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    clerkConfigured,
    clerkKeyMode,
    clerkProductionReady: clerkKeyMode === "live",
    ownerEmailsConfigured: Boolean(process.env.OWNER_EMAILS),
    aiContentEnabled: process.env.ENABLE_AI_CONTENT_GENERATION === "true",
    aiMetricAnalysisEnabled: process.env.ENABLE_AI_METRIC_ANALYSIS === "true",
  });
}
