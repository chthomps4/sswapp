import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { renderPrompt } from "@/lib/prompts/renderPrompt";

export async function POST(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const input = await request.json();
  if (process.env.ENABLE_AI_CONTENT_GENERATION !== "true") {
    return NextResponse.json({
      status: "blocked",
      error: "ENABLE_AI_CONTENT_GENERATION is false. Prompt test runs can render prompts, but they will not call an AI provider.",
    });
  }
  const rendered = await renderPrompt({ promptKey: input.promptKey, variables: input.variables || {} });
  return NextResponse.json({
    status: "ready",
    renderedPromptPreview: rendered.finalPrompt.slice(0, 1200),
    promptKey: rendered.promptKey,
    promptVersion: rendered.promptVersion,
  });
}
