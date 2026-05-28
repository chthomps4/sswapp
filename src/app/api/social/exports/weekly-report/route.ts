import { NextResponse } from "next/server";
import { createSampleSocialImport, exportWeeklySocialReportMarkdown } from "@/lib/social-dashboard-engine";

export async function GET() {
  const sample = createSampleSocialImport();
  return new NextResponse(exportWeeklySocialReportMarkdown(sample.snapshots, sample.socialPosts, sample.insights), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="weekly-social-report-2026-05-28-to-2026-05-28.md"',
    },
  });
}
