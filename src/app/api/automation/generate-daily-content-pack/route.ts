import { NextResponse } from "next/server";
import { createDailyContentPack } from "@/lib/automation-engine";
import { dailyPackInputSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const json = await request.json().catch(() => ({}));
  const parsed = dailyPackInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid daily pack input.", issues: parsed.error.issues }, { status: 400 });
  }

  return NextResponse.json(createDailyContentPack(parsed.data));
}
