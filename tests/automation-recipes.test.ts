import assert from "node:assert/strict";
import test from "node:test";
import { createSampleDailyContentPack } from "../src/lib/automation-engine";
import {
  getAutomationRecipes,
  runApprovalSummaryAutomation,
  runCaptionRewriteAutomation,
  runImagePromptBatchAutomation,
  runPerformanceContextAutomation,
  runRepurposePlanAutomation,
  runTodayAutomation,
  runWeeklySocialAnalysisAutomation,
} from "../src/lib/automation-recipes";

test("seeded automation recipes are manual and safe by default", () => {
  const recipes = getAutomationRecipes();
  assert.ok(recipes.some((recipe) => recipe.slug === "run-today"));
  assert.ok(recipes.every((recipe) => recipe.triggerType === "manual" || recipe.slug === "weekly-workflow-gap-audit"));
  assert.equal(recipes.find((recipe) => recipe.slug === "weekly-workflow-gap-audit")?.defaultSettingsJson.scheduledEnabled, false);
  assert.ok(recipes.every((recipe) => JSON.stringify(recipe.featureFlagsJson).includes("false") || JSON.stringify(recipe.featureFlagsJson).includes("blocked") || recipe.slug === "image-prompt-batch" || recipe.slug === "weekly-social-analysis"));
});

test("Run Today creates content pack, drafts, image prompts, approvals, and automation run", async () => {
  const result = await runTodayAutomation({
    date: "2026-05-28",
    strategicPriority: "Create practical visibility.",
  });
  assert.equal(result.pack.contentPack.status, "needs_review");
  assert.ok(result.pack.postDrafts.length > 0);
  assert.equal(result.pack.imagePrompts.length, result.pack.postDrafts.length);
  assert.equal(result.pack.approvals.every((approval) => approval.status === "pending"), true);
  assert.equal(result.pack.postDrafts.every((draft) => draft.status === "needs_review"), true);
  assert.equal(result.automationRun.type, "run_today");
  assert.equal(result.automationRun.promptKey, "daily-content-pack");
});

test("Run Today honors selected brand and platform filters", async () => {
  const result = await runTodayAutomation({
    date: "2026-05-28",
    strategicPriority: "Local proof only.",
    selectedBrands: ["al-brothers"],
    selectedPlatforms: ["facebook", "google-business-profile"],
  });
  assert.ok(result.pack.postDrafts.length > 0);
  assert.equal(result.pack.postDrafts.every((draft) => draft.brandSlug === "al-brothers"), true);
  assert.equal(result.pack.postDrafts.every((draft) => ["facebook", "google-business-profile"].includes(draft.platformSlug)), true);
  assert.equal(result.pack.postDrafts.every((draft) => draft.status === "needs_review"), true);
  assert.equal(result.pack.approvals.every((approval) => approval.status === "pending"), true);
});

test("image prompt batch only fills missing prompts", async () => {
  const pack = createSampleDailyContentPack("2026-05-28");
  const missingOne = { ...pack, imagePrompts: pack.imagePrompts.slice(1) };
  const result = await runImagePromptBatchAutomation(missingOne);
  assert.equal(result.imagePrompts.length, 1);
  assert.equal(result.imagePrompts[0].postDraftId, pack.postDrafts[0].id);
  assert.equal(result.imagePrompts[0].status, "needs_review");
});

test("caption rewrite preserves original copy", async () => {
  const pack = createSampleDailyContentPack("2026-05-28");
  const draft = pack.postDrafts[0];
  const result = await runCaptionRewriteAutomation(draft, "make_more_direct", "Tighten the opening.");
  assert.equal(result.rewritten.originalBody, draft.body);
  assert.notEqual(result.rewritten.rewrittenBody.length, 0);
  assert.equal(result.rewritten.status, "needs_review");
});

test("approval summary does not auto-approve anything", async () => {
  const pack = createSampleDailyContentPack("2026-05-28");
  const result = await runApprovalSummaryAutomation(pack);
  assert.equal(result.summary.approvalChecklist.some((item) => item.label === "No auto-approval" && item.passed), true);
  assert.equal(pack.approvals.every((approval) => approval.status === "pending"), true);
});

test("weekly analysis uses sanitized summaries with AI metric analysis disabled", async () => {
  const original = process.env.ENABLE_AI_METRIC_ANALYSIS;
  delete process.env.ENABLE_AI_METRIC_ANALYSIS;
  const result = await runWeeklySocialAnalysisAutomation();
  if (original === undefined) delete process.env.ENABLE_AI_METRIC_ANALYSIS;
  else process.env.ENABLE_AI_METRIC_ANALYSIS = original;
  const output = result.output as { mode: string; rawRowsSentToAi: boolean; sanitizedOnly: boolean };
  assert.equal(output.mode, "rule_based_ai_blocked");
  assert.equal(output.rawRowsSentToAi, false);
  assert.equal(output.sanitizedOnly, true);
});

test("performance context excludes raw private rows", async () => {
  const result = await runPerformanceContextAutomation();
  const context = result.context as { summaryForPrompt: string };
  assert.ok(context.summaryForPrompt.length > 0);
  assert.doesNotMatch(JSON.stringify(context), /rawJson|normalizedJson|email|phone/i);
});

test("repurpose plan creates platform-native variations", async () => {
  const result = await runRepurposePlanAutomation(undefined, ["facebook", "instagram", "newsletter"]);
  assert.equal(result.repurposePlan.length, 3);
  assert.notEqual(result.repurposePlan[0].format, result.repurposePlan[1].format);
  assert.deepEqual(result.automationRun.recordsCreated, { plannedDrafts: 3 });
  assert.equal(result.automationRun.type, "repurpose_winning_post");
});
