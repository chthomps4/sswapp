import { NextResponse } from "next/server";
import { createSampleDailyContentPack, exportWeeklyReportMarkdown, sampleMetricsForPack } from "@/lib/automation-engine";

export async function GET() {
  const pack = createSampleDailyContentPack();
  return new NextResponse(exportWeeklyReportMarkdown(sampleMetricsForPack(pack), pack.postDrafts), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": 'attachment; filename="weekly-performance-report.md"',
    },
  });
}
