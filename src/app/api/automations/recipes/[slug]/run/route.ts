import { NextResponse } from "next/server";
import { runAutomationRecipe } from "@/lib/automation-recipes";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await runAutomationRecipe(slug, { strategicPriority: "Manual recipe run from UI" });
  return NextResponse.json(result);
}
