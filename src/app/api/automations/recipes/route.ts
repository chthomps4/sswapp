import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { getAutomationRecipes } from "@/lib/automation-recipes";

export async function GET() {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  return NextResponse.json({ recipes: getAutomationRecipes() });
}
