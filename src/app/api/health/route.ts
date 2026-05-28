import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "sswapp",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    clerkConfigured: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY),
    ownerEmailsConfigured: Boolean(process.env.OWNER_EMAILS),
    aiContentEnabled: process.env.ENABLE_AI_CONTENT_GENERATION === "true",
    aiMetricAnalysisEnabled: process.env.ENABLE_AI_METRIC_ANALYSIS === "true",
  });
}
