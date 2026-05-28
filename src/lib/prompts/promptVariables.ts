import { seedBrands, seedCampaigns, seedContentPillars, seedPlatforms, seedPosts } from "@/lib/seed-data";
import { createSampleSocialImport, getPerformanceContextForPrompt } from "@/lib/social-dashboard-engine";

const signalWorkshop = seedBrands.find((brand) => brand.slug === "signal-workshop") || seedBrands[0];
const localSignal = seedBrands.find((brand) => brand.slug === "local-signal-websites") || seedBrands[0];
const parallax = seedBrands.find((brand) => brand.slug === "parallax-hearts") || seedBrands[0];
const alBrothers = seedBrands.find((brand) => brand.slug === "al-brothers") || seedBrands[0];
const linkedIn = seedPlatforms.find((platform) => platform.slug === "linkedin") || seedPlatforms[0];
const instagram = seedPlatforms.find((platform) => platform.slug === "instagram") || seedPlatforms[0];
const facebook = seedPlatforms.find((platform) => platform.slug === "facebook") || seedPlatforms[0];
const gbp = seedPlatforms.find((platform) => platform.slug === "google-business-profile") || seedPlatforms[0];
const sampleImport = createSampleSocialImport();
const performanceContext = getPerformanceContextForPrompt({ metrics: sampleImport.snapshots, posts: sampleImport.socialPosts });
const performanceSummary =
  performanceContext.recommendations.length > 0
    ? performanceContext.recommendations.join(" ")
    : "Sanitized performance context is available but limited.";

export function buildSamplePromptVariables(promptKey: string): Record<string, unknown> {
  const base = {
    date: "2026-05-28",
    dailyTheme: "Your online presence should not require a full-time employee to manage.",
    strategicPriority: "Create useful daily visibility without creating another full-time operations burden.",
    selectedBrands: seedBrands.map((brand) => brand.slug),
    selectedPlatforms: ["linkedin", "facebook", "instagram", "google-business-profile", "x"],
    activeCampaigns: seedCampaigns,
    currentOffers: seedCampaigns.map((campaign) => campaign.offer),
    recentPerformanceContext: performanceContext,
    businessNotes: "All generated content must remain needs_review and ready for manual posting.",
    brandContext: seedBrands,
    platformContext: seedPlatforms,
    businessPriorities: ["lead generation", "authority", "community trust", "daily visibility"],
    postingFrequencyRules: "Do not force every brand to post every day.",
    brand: signalWorkshop,
    platform: linkedIn,
    contentPillar: seedContentPillars[0],
    campaign: seedCampaigns[0],
    offer: seedCampaigns[0].offer,
    audience: signalWorkshop.audience,
    postObjective: "Build trust through practical systems thinking.",
    hookDirection: "Make the first line diagnostic and concrete.",
    voiceGuidelines: signalWorkshop.voiceGuidelines,
    visualStyle: signalWorkshop.visualStyle,
    forbiddenPhrases: signalWorkshop.forbiddenPhrases,
    ctaOptions: [signalWorkshop.defaultCTA],
    post: seedPosts[0],
    imageStyleRules: ["Readable on mobile", "Clarify the idea", "Avoid generic stock photo energy"],
    forbiddenVisualElements: ["fake charts", "unsafe jobsite scenes", "platform logos"],
    assetFilenameFormat: "YYYY-MM-DD_brand_platform_contentpillar_campaign_v01.ext",
    communityType: "small business operations",
    relevantExperience: "Internal content operations and local service brand work.",
    disclosureRequirement: "Mention brand affiliation if relevant.",
    serviceArea: "Greenville and Upstate SC",
    service: "punch list closeout and finish work",
    proofPoint: "Builder-friendly closeout support.",
    cta: "Request a quote.",
    sourcePosts: seedPosts.slice(0, 2),
    originalCaption: seedPosts[0].body,
    rewriteReason: "remove_ai_sounding_language",
    desiredDirection: "make_more_direct",
    contentPack: { id: "pack-sample", dailyTheme: "Your online presence should not require a full-time employee to manage." },
    posts: seedPosts,
    imagePrompts: seedPosts.map((post) => ({ postDraftId: post.id, prompt: post.imagePrompt, altText: post.altText })),
    knownRisks: ["unsupported claims", "generic language", "privacy risk"],
    weekStart: "2026-05-25",
    weekEnd: "2026-05-31",
    audienceNotes: "Business owners want practical systems that can survive busy weeks.",
    marketNotes: "Social content needs to be useful, not duplicated across platforms.",
    dateRange: "2026-05-01 to 2026-05-28",
    sanitizedMetricsSummary: performanceSummary,
    topPosts: performanceContext.topPosts,
    weakPosts: performanceContext.weakestPosts,
    benchmarks: [],
    metricRollups: sampleImport.rollups,
    performanceInsights: sampleImport.insights,
    topPerformancePatterns: performanceContext.recommendations,
    weakPerformancePatterns: ["Posts without a clear CTA create fewer useful actions."],
    acceptedInsights: sampleImport.insights.slice(0, 2),
    contentGaps: ["More local proof posts", "More website audit education"],
    sourceItem: seedPosts[0],
    originalPlatform: linkedIn,
    targetPlatforms: ["facebook", "instagram", "newsletter"],
    reason: "Strong hook and reusable practical framework.",
    campaignGoal: "Drive workshop registrations and booked calls.",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    platforms: seedPlatforms.slice(0, 5),
    constraints: "No auto-publishing. No unsupported claims.",
    auditSource: "SiteSignal",
    websiteUrl: "https://example.com",
    auditFindings: "Homepage hides the service area and contact path.",
    month: "June 2026",
    brands: seedBrands,
    campaigns: seedCampaigns,
    offers: seedCampaigns.map((campaign) => campaign.offer),
    knownDates: ["2026-06-03 workshop waitlist push"],
    generatedOutput: seedPosts[0],
    promptKey,
  };

  if (promptKey === "image-prompt") return { ...base, brand: localSignal, platform: instagram, post: seedPosts[1], visualStyle: localSignal.visualStyle };
  if (promptKey === "carousel-outline") return { ...base, brand: parallax, platform: instagram, visualStyle: parallax.visualStyle, audience: parallax.audience };
  if (promptKey === "google-business-profile-post") return { ...base, brand: alBrothers, platform: gbp, serviceArea: "Greenville and Upstate SC" };
  if (promptKey === "dashboard-analysis") return { ...base, brand: signalWorkshop, platform: facebook };
  return base;
}
