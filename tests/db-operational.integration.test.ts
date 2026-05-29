import assert from "node:assert/strict";
import test from "node:test";

test("DB integration: seed and Run Today persistence", { skip: !process.env.TEST_DATABASE_URL }, async () => {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  const { runTodayAutomation } = await import("../src/lib/automation-recipes");
  const { getContentPackById, persistGeneratedContentPack, seedOperationalDatabase } = await import("../src/lib/db-operational");

  await seedOperationalDatabase();
  const generated = await runTodayAutomation({
    date: "2026-05-28",
    strategicPriority: "Integration test",
    selectedBrands: ["signal-workshop"],
    selectedPlatforms: ["linkedin"],
  });
  const persisted = await persistGeneratedContentPack(generated.pack);
  const reloaded = await getContentPackById(persisted.contentPack.id);

  assert.ok(reloaded);
  assert.equal(reloaded?.postDrafts.every((draft) => draft.brandSlug === "signal-workshop"), true);
  assert.equal(reloaded?.postDrafts.every((draft) => draft.platformSlug === "linkedin"), true);
  assert.equal(reloaded?.postDrafts.every((draft) => draft.status === "needs_review"), true);
  assert.equal(reloaded?.approvals.every((approval) => approval.status === "pending"), true);
});
