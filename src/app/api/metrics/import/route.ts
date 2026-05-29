import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { parseCsv, weeklyReport, seedPosts } from "@/lib/content-engine";
import { metricsImportSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const json = await request.json().catch(() => null);
  const parsed = metricsImportSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid metrics import.", issues: parsed.error.issues }, { status: 400 });
  }

  const rows = parseCsv(parsed.data.csv);
  return NextResponse.json({
    importedRows: Math.max(rows.length - 1, 0),
    report: weeklyReport(seedPosts),
  });
}
