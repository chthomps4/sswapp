import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { exportSocialWeeklyReportFromDb, isDatabaseConfigured } from "@/lib/db-operational";
import { createSampleSocialImport, exportWeeklySocialReportMarkdown } from "@/lib/social-dashboard-engine";

export async function GET() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const sample = createSampleSocialImport();
  const markdown = isDatabaseConfigured() ? await exportSocialWeeklyReportFromDb() : exportWeeklySocialReportMarkdown(sample.snapshots, sample.socialPosts, sample.insights);
  return new NextResponse(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="weekly-social-report-2026-05-28-to-2026-05-28.md"',
    },
  });
}
