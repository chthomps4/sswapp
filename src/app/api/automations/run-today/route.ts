import { NextResponse } from "next/server";
import { runTodayAutomation } from "@/lib/automation-recipes";
import { requireOwnerResponse } from "@/lib/auth";
import { isDatabaseConfigured, persistGeneratedContentPack } from "@/lib/db-operational";

export async function POST(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const input = await request.json();
  const result = await runTodayAutomation({
    strategicPriority: input.strategicPriority || "Daily useful visibility",
    ...input,
  });
  const persistedPack = isDatabaseConfigured() ? await persistGeneratedContentPack(result.pack) : result.pack;
  const packUrl = isDatabaseConfigured() ? `/packs/${persistedPack.contentPack.id}` : "/packs/run-today";

  return NextResponse.json({
    message: result.message,
    databaseMode: isDatabaseConfigured(),
    packUrl,
    contentPackId: persistedPack.contentPack.id,
    posts: persistedPack.postDrafts.length,
    imagePrompts: persistedPack.imagePrompts.length,
    approvals: persistedPack.approvals.length,
    automationRun: persistedPack.automationRun,
    promptRenders: result.promptRenders,
  });
}
