import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { createSampleDailyContentPack, exportImagePromptsJson } from "@/lib/automation-engine";
import { exportImagePromptsFromDb, isDatabaseConfigured } from "@/lib/db-operational";

export async function GET(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const contentPackId = searchParams.get("contentPackId") || undefined;
  const json = isDatabaseConfigured() ? await exportImagePromptsFromDb(contentPackId) : exportImagePromptsJson(createSampleDailyContentPack());
  return new NextResponse(json, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="image-prompts.json"',
    },
  });
}
