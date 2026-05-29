import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { createSampleDailyContentPack, exportImagePromptsJson } from "@/lib/automation-engine";

export async function POST() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  return NextResponse.json({
    mode: "template",
    batch: JSON.parse(exportImagePromptsJson(createSampleDailyContentPack())),
  });
}
