import { NextResponse } from "next/server";
import { createSampleSocialImport, getPerformanceContextForPrompt } from "@/lib/social-dashboard-engine";

export async function GET() {
  const sample = createSampleSocialImport();
  return NextResponse.json({
    context: getPerformanceContextForPrompt({
      metrics: sample.snapshots,
      posts: sample.socialPosts,
    }),
    privacy: "Sanitized aggregate context only. Raw imported dashboard rows are not included.",
  });
}
