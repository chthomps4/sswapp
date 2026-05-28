import { readFile } from "node:fs/promises";
import path from "node:path";
import { promptKeys } from "./prompts/promptRegistry";
import { renderPrompt as renderRegisteredPrompt } from "./prompts/renderPrompt";

export type PromptVariables = Record<string, string | number | boolean | string[] | null | undefined>;

const allowedTemplateNames = new Set([
  "daily-content-pack",
  "platform-post",
  "image-prompt",
  "carousel-outline",
  "reddit-discussion",
  "google-business-profile-post",
  "weekly-research-brief",
  "metrics-analysis",
  "caption-rewrite",
  "approval-summary",
]);

function serializeVariable(value: PromptVariables[string]) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

export async function loadPromptTemplate(templateName: string) {
  if (!allowedTemplateNames.has(templateName)) {
    throw new Error(`Unknown prompt template: ${templateName}`);
  }

  const templatePath = path.join(process.cwd(), "src", "prompts", `${templateName}.md`);
  return readFile(templatePath, "utf8");
}

export async function renderPrompt(templateName: string, variables: PromptVariables) {
  if (promptKeys.includes(templateName)) {
    try {
      const result = await renderRegisteredPrompt({ promptKey: templateName, variables });
      return result.finalPrompt;
    } catch (error) {
      if (!allowedTemplateNames.has(templateName)) throw error;
    }
  }
  const template = await loadPromptTemplate(templateName);
  return renderPromptText(template, variables);
}

export function renderPromptText(template: string, variables: PromptVariables) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, key: string) => serializeVariable(variables[key]));
}
