import { NextResponse } from "next/server";
import { createSampleDailyContentPack, exportImagePromptsJson } from "@/lib/automation-engine";

export async function POST() {
  return NextResponse.json({
    mode: "template",
    batch: JSON.parse(exportImagePromptsJson(createSampleDailyContentPack())),
  });
}
