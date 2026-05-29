import assert from "node:assert/strict";
import test from "node:test";
import { createSampleDailyContentPack } from "../src/lib/automation-engine";
import { createDashboardDataFromPack, postDraftToDashboardPost } from "../src/lib/dashboard-data";

test("dashboard snapshot can represent persisted content and social counts", () => {
  const pack = createSampleDailyContentPack("2026-05-29");
  const data = createDashboardDataFromPack(pack, {
    contentSource: "database",
    socialCounts: {
      source: "database",
      imports: 2,
      snapshots: 12,
      insights: 4,
      issues: 1,
    },
  });

  assert.equal(data.snapshot.contentSource, "database");
  assert.equal(data.snapshot.statusMode, "persistent");
  assert.equal(data.snapshot.latestPackId, pack.contentPack.id);
  assert.equal(data.snapshot.totalDrafts, pack.postDrafts.length);
  assert.equal(data.snapshot.imagePromptCount, pack.imagePrompts.length);
  assert.equal(data.snapshot.socialImportCount, 2);
  assert.equal(data.snapshot.socialSnapshotCount, 12);
  assert.equal(data.snapshot.socialInsightCount, 4);
  assert.equal(data.snapshot.unresolvedImportIssueCount, 1);
  assert.ok(data.snapshot.nextActions.some((action) => action.includes("Run Today")));
});

test("dashboard snapshot falls back to preview-only deterministic data", () => {
  const pack = createSampleDailyContentPack("2026-05-29");
  const data = createDashboardDataFromPack(pack);

  assert.equal(data.snapshot.contentSource, "deterministic_fallback");
  assert.equal(data.snapshot.socialSource, "deterministic_fallback");
  assert.equal(data.snapshot.statusMode, "preview_only");
  assert.equal(data.posts.length, pack.postDrafts.length);
  assert.ok(data.snapshot.warnings.some((warning) => warning.includes("No persisted content pack")));
});

test("dashboard post mapping carries image prompt and review-safe status fields", () => {
  const pack = createSampleDailyContentPack("2026-05-29");
  const draft = pack.postDrafts[0];
  const imagePrompt = pack.imagePrompts.find((prompt) => prompt.postDraftId === draft.id);
  assert.ok(imagePrompt);

  const post = postDraftToDashboardPost(draft, imagePrompt);

  assert.equal(post.id, draft.id);
  assert.equal(post.approvalStatus, draft.status);
  assert.equal(post.publishingStatus, "not_scheduled");
  assert.equal(post.imagePrompt, imagePrompt.prompt);
  assert.equal(post.altText, imagePrompt.altText);
  assert.equal(post.assetFilename, imagePrompt.filename);
});
