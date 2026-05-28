import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { createSampleDailyContentPack, exportAssetManifestJson } from "@/lib/automation-engine";
import { exportAssetManifestFromDb, isDatabaseConfigured } from "@/lib/db-operational";

export async function GET(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const contentPackId = searchParams.get("contentPackId") || undefined;
  const json = isDatabaseConfigured() ? await exportAssetManifestFromDb(contentPackId) : exportAssetManifestJson(createSampleDailyContentPack());
  return new NextResponse(json, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="manifest.json"',
    },
  });
}
