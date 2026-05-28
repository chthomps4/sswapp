import { NextResponse } from "next/server";
import { getAutomationRecipes } from "@/lib/automation-recipes";

export function GET() {
  return NextResponse.json({ recipes: getAutomationRecipes() });
}
