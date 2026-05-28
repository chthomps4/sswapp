import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPromptMetadata } from "./promptRegistry";
import type { PromptRenderInput, PromptRenderResult } from "./promptTypes";

const systemTemplateFiles = {
  guardrails: "system/base-brand-guardrails.md",
  privacy: "system/privacy-rules.md",
  output: "system/output-format-rules.md",
};

function promptPath(filename: string) {
  return path.join(process.cwd(), "src", "prompts", filename);
}

async function loadTemplate(filename: string) {
  return readFile(promptPath(filename), "utf8");
}

function getByPath(source: Record<string, unknown>, variablePath: string) {
  return variablePath.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object" && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

function hasValue(value: unknown) {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function serializeValue(value: unknown) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

export function validatePromptVariables(promptKey: string, variables: Record<string, unknown>) {
  const metadata = getPromptMetadata(promptKey);
  return metadata.requiredVariables.filter((key) => !hasValue(getByPath(variables, key)));
}

export { getPromptMetadata };

export async function renderPrompt({
  promptKey,
  variables,
  includeSystemGuardrails = true,
  includePrivacyRules = true,
  includeOutputRules = true,
}: PromptRenderInput): Promise<PromptRenderResult> {
  const metadata = getPromptMetadata(promptKey);
  const missingVariables = validatePromptVariables(promptKey, variables);
  if (missingVariables.length) {
    throw new Error(`Missing required variables for ${promptKey}: ${missingVariables.join(", ")}`);
  }

  const [template, guardrails, privacyRules, outputRules] = await Promise.all([
    loadTemplate(metadata.filename),
    includeSystemGuardrails ? loadTemplate(systemTemplateFiles.guardrails) : Promise.resolve(""),
    includePrivacyRules ? loadTemplate(systemTemplateFiles.privacy) : Promise.resolve(""),
    includeOutputRules ? loadTemplate(systemTemplateFiles.output) : Promise.resolve(""),
  ]);

  const variablesUsed = new Set<string>();
  const renderedTemplate = template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    variablesUsed.add(key);
    return serializeValue(getByPath(variables, key));
  });

  const finalPrompt = [guardrails, privacyRules, outputRules, renderedTemplate].filter(Boolean).join("\n\n---\n\n");

  return {
    finalPrompt,
    promptKey,
    promptVersion: metadata.version,
    variablesUsed: [...variablesUsed],
    missingVariables: [],
    renderedAt: new Date().toISOString(),
  };
}
