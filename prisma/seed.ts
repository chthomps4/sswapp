import { createSampleDailyContentPack, sampleMetricsForPack } from "../src/lib/automation-engine";
import { automationRecipes } from "../src/lib/automation-recipes";
import { isDatabaseConfigured, persistGeneratedContentPack, seedOperationalDatabase } from "../src/lib/db-operational";
import { promptRegistry } from "../src/lib/prompts/promptRegistry";
import { seedBrands, seedCampaigns, seedContentPillars, seedPlatforms, seedPosts } from "../src/lib/seed-data";
import { mappingTemplates, socialAccounts } from "../src/lib/social-dashboard-engine";

async function main() {
  const samplePack = createSampleDailyContentPack("2026-05-28");
  if (isDatabaseConfigured()) {
    await seedOperationalDatabase();
    await persistGeneratedContentPack(samplePack);
  }

  console.log(
    JSON.stringify(
      {
        mode: isDatabaseConfigured() ? "database_seeded" : "dry_run_no_database_url",
        brands: seedBrands.length,
        platforms: seedPlatforms.length,
        contentPillars: seedContentPillars.length,
        campaigns: seedCampaigns.length,
        postVariants: seedPosts.length,
        sampleContentPack: samplePack.contentPack.title,
        samplePostDrafts: samplePack.postDrafts.length,
        sampleImagePrompts: samplePack.imagePrompts.length,
        sampleApprovals: samplePack.approvals.length,
        sampleMetrics: sampleMetricsForPack(samplePack).length,
        socialAccounts: socialAccounts.length,
        socialMetricMappingTemplates: mappingTemplates.length,
        automationRecipes: automationRecipes.length,
        promptTemplates: promptRegistry.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
