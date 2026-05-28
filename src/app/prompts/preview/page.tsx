import { PromptPreviewWorkbench } from "@/components/prompt-preview-workbench";
import { ContentPageShell } from "@/components/content-page-shell";
import { promptRegistry } from "@/lib/prompts/promptRegistry";
import { buildSamplePromptVariables } from "@/lib/prompts/promptVariables";

export default function PromptPreviewPage() {
  const samples = Object.fromEntries(promptRegistry.map((prompt) => [prompt.key, buildSamplePromptVariables(prompt.key)]));
  return (
    <ContentPageShell
      eyebrow="Prompt debugger"
      title="Prompt Preview"
      description="Render any prompt with sample or edited variables, inspect included guardrails, and copy the final prompt."
    >
      <PromptPreviewWorkbench prompts={promptRegistry} samples={samples} />
    </ContentPageShell>
  );
}
