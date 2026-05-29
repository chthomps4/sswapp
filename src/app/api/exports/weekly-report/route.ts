import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { createSampleDailyContentPack, exportWeeklyReportMarkdown, sampleMetricsForPack } from "@/lib/automation-engine";
import { exportSocialWeeklyReportFromDb, isDatabaseConfigured } from "@/lib/db-operational";

export async function GET() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  if (isDatabaseConfigured()) {
    return new NextResponse(await exportSocialWeeklyReportFromDb(), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": 'attachment; filename="weekly-performance-report.md"',
      },
    });
  }
  const pack = createSampleDailyContentPack();
  return new NextResponse(exportWeeklyReportMarkdown(sampleMetricsForPack(pack), pack.postDrafts), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="weekly-performance-report.md"',
    },
  });
}
