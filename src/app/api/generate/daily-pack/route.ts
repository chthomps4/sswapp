import { NextResponse } from "next/server";
import { generateDailyPack } from "@/lib/openai";
import { dailyPackInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = dailyPackInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid daily pack input.", issues: parsed.error.issues }, { status: 400 });
  }

  const result = await generateDailyPack(parsed.data);
  return NextResponse.json(result);
}
