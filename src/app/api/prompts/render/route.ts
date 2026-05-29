import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { renderPrompt, validatePromptVariables } from "@/lib/prompts/renderPrompt";

export async function POST(request: Request) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  try {
    const input = await request.json();
    const missingVariables = validatePromptVariables(input.promptKey, input.variables || {});
    if (missingVariables.length) {
      return NextResponse.json({ error: `Missing required variables: ${missingVariables.join(", ")}`, missingVariables }, { status: 400 });
    }
    const rendered = await renderPrompt({
      promptKey: input.promptKey,
      variables: input.variables || {},
      includeSystemGuardrails: input.includeSystemGuardrails !== false,
      includePrivacyRules: input.includePrivacyRules !== false,
      includeOutputRules: input.includeOutputRules !== false,
    });
    return NextResponse.json(rendered);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Prompt render failed." }, { status: 400 });
  }
}
