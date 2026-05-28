import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { promptRegistry } from "../src/lib/prompts/promptRegistry";
import { buildSamplePromptVariables } from "../src/lib/prompts/promptVariables";
import { renderPrompt, validatePromptVariables } from "../src/lib/prompts/renderPrompt";
import { validatePromptRegistryCompleteness } from "../src/lib/prompts/promptValidation";

test("prompt registry lists every automation prompt with metadata", () => {
  const completeness = validatePromptRegistryCompleteness();
  assert.equal(completeness.count, 20);
  assert.equal(completeness.hasAllRequiredKeys, true);
  assert.deepEqual(completeness.duplicateKeys, []);
  assert.ok(promptRegistry.every((prompt) => prompt.version && prompt.title && prompt.privacyLevel && prompt.outputMode));
});

test("required variables validate clearly and nested variables render", async () => {
  const missing = validatePromptVariables("platform-post", { brand: { name: "Signal Workshop" } });
  assert.ok(missing.includes("platform"));

  const rendered = await renderPrompt({
    promptKey: "platform-post",
    variables: buildSamplePromptVariables("platform-post"),
  });
  assert.match(rendered.finalPrompt, /Signal Workshop/);
  assert.match(rendered.finalPrompt, /Privacy rules:/);
  assert.match(rendered.finalPrompt, /Output rules:/);
  assert.doesNotMatch(rendered.finalPrompt, /\{\{brand\}\}/);
});

test("all JSON prompts declare JSON output and render with fixtures", async () => {
  for (const prompt of promptRegistry) {
    assert.equal(prompt.outputMode, "json", prompt.key);
    const rendered = await renderPrompt({ promptKey: prompt.key, variables: buildSamplePromptVariables(prompt.key) });
    assert.match(rendered.finalPrompt, /Return valid JSON|Return JSON|valid JSON/i, prompt.key);
    assert.equal(rendered.promptVersion, prompt.version);
  }
});

test("prompt templates do not auto-approve or auto-publish generated content", async () => {
  const files = await Promise.all(promptRegistry.map((prompt) => readFile(`src/prompts/${prompt.filename}`, "utf8")));
  for (const file of files) {
    assert.doesNotMatch(file, /"status"\s*:\s*"approved"/i);
    assert.doesNotMatch(file, /"status"\s*:\s*"posted"/i);
    assert.doesNotMatch(file, /\bauto-publish\b(?!ing)/i);
  }
});

test("analytics prompts require sanitized metrics only", () => {
  const analyticsPrompts = promptRegistry.filter((prompt) => prompt.category === "analytics");
  assert.ok(analyticsPrompts.length >= 3);
  assert.ok(analyticsPrompts.every((prompt) => prompt.privacyLevel === "sanitized_metrics_only"));
});

test("quality check template renders with sample data", async () => {
  const rendered = await renderPrompt({
    promptKey: "prompt-quality-check",
    variables: buildSamplePromptVariables("prompt-quality-check"),
  });
  assert.match(rendered.finalPrompt, /approvalRisk/);
  assert.match(rendered.finalPrompt, /brand_voice/);
});
