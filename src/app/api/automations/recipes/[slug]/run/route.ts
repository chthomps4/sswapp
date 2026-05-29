import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { runAutomationRecipe } from "@/lib/automation-recipes";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { slug } = await params;
  const input = await request.json().catch(() => ({}));
  const result = await runAutomationRecipe(slug, { strategicPriority: "Manual recipe run from UI", ...input });
  return NextResponse.json(result);
}
