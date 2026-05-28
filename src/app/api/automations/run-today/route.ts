import { NextResponse } from "next/server";
import { runTodayAutomation } from "@/lib/automation-recipes";

export async function POST(request: Request) {
  const input = await request.json();
  const result = await runTodayAutomation({
    strategicPriority: input.strategicPriority || "Daily useful visibility",
    ...input,
  });
  return NextResponse.json({
    message: result.message,
    packUrl: "/packs/run-today",
    contentPackId: result.pack.contentPack.id,
    posts: result.pack.postDrafts.length,
    imagePrompts: result.pack.imagePrompts.length,
    approvals: result.pack.approvals.length,
    automationRun: result.automationRun,
    promptRenders: result.promptRenders,
  });
}
