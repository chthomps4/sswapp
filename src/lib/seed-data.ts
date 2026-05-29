import { brandConfigs } from "../config/brands";
import type { Brand, Campaign, ContentPillar, MetricSnapshot, Platform, PostVariant } from "./types";
import { generateAssetFilename } from "./utils";

const emptyMetrics: MetricSnapshot = {
  reach: 0,
  impressions: 0,
  engagements: 0,
  comments: 0,
  shares: 0,
  saves: 0,
  clicks: 0,
  dms: 0,
  leads: 0,
  registrations: 0,
};

const brandMeta: Record<
  string,
  {
    businessType: string;
    description: string;
    websiteUrl: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    socialProfiles: Brand["socialProfiles"];
    notes: string;
  }
> = {
  "signal-workshop": {
    businessType: "Umbrella business systems and signal operations brand",
    description: "Websites, social media, content, training, and simple business systems.",
    websiteUrl: "https://signalworkshop.studio",
    primaryColor: "#1e6b4d",
    secondaryColor: "#15211b",
    accentColor: "#b8e986",
    notes: "Core umbrella brand and operating-system voice.",
    socialProfiles: [
      {
        platform: "LinkedIn",
        handle: "",
        profileUrl: "https://www.linkedin.com/",
        composerUrl: "https://www.linkedin.com/feed/",
        adminUrl: "https://www.linkedin.com/",
        notes: "Update when the official page/profile URL is confirmed.",
      },
      {
        platform: "Facebook",
        handle: "",
        profileUrl: "https://www.facebook.com/",
        composerUrl: "https://www.facebook.com/",
        adminUrl: "https://business.facebook.com/",
        notes: "Manual destination until official page URL is confirmed.",
      },
    ],
  },
  "business-signal-workshop": {
    businessType: "Workshop, content product, and strategy lane",
    description: "Business clarity, signal detection, decision filters, and practical growth thinking.",
    websiteUrl: "https://signalworkshop.studio",
    primaryColor: "#214f6b",
    secondaryColor: "#17211d",
    accentColor: "#f0b85a",
    notes: "Authority-building content lane under Signal Workshop.",
    socialProfiles: [
      {
        platform: "LinkedIn",
        handle: "",
        profileUrl: "https://www.linkedin.com/",
        composerUrl: "https://www.linkedin.com/feed/",
        adminUrl: "https://www.linkedin.com/",
        notes: "Use for owner/operator authority posts.",
      },
      {
        platform: "X",
        handle: "",
        profileUrl: "https://x.com/",
        composerUrl: "https://x.com/compose/post",
        adminUrl: "https://x.com/",
        notes: "Use for concise threads and signal lines.",
      },
    ],
  },
  "local-signal-websites": {
    businessType: "Custom websites and local visibility services",
    description: "Website packages, local SEO, Google Business Profile, and no-template/no-lock-in positioning.",
    websiteUrl: "https://localsignalwebsites.studio",
    primaryColor: "#1e6b4d",
    secondaryColor: "#f5f7f4",
    accentColor: "#e5a83c",
    notes: "Facebook URL may be profile-style and should stay editable.",
    socialProfiles: [
      {
        platform: "Facebook",
        handle: "",
        profileUrl: "https://www.facebook.com/profile.php?id=61576498498498",
        composerUrl: "https://www.facebook.com/profile.php?id=61576498498498",
        adminUrl: "https://business.facebook.com/",
        notes: "Profile link from the public website; update if a clean handle is confirmed.",
      },
      {
        platform: "Website",
        handle: "localsignalwebsites.studio",
        profileUrl: "https://localsignalwebsites.studio",
        composerUrl: "https://localsignalwebsites.studio",
        adminUrl: "https://vercel.com/",
        notes: "Primary service website.",
      },
    ],
  },
  sitesignal: {
    businessType: "Website audit and lead diagnostic tool",
    description: "Website improvement signals and client opportunity diagnostics.",
    websiteUrl: "https://sitesignal.company",
    primaryColor: "#29627d",
    secondaryColor: "#0f1720",
    accentColor: "#82c6a0",
    notes: "Audit and diagnostic product under the Signal Workshop umbrella.",
    socialProfiles: [
      {
        platform: "Website",
        handle: "sitesignal.company",
        profileUrl: "https://sitesignal.company",
        composerUrl: "https://sitesignal.company",
        adminUrl: "https://sitesignal.company",
        notes: "Primary SiteSignal dashboard and diagnostic product URL.",
      },
    ],
  },
  "parallax-hearts": {
    businessType: "Creative music and story-world brand",
    description: "Vallen, story fragments, songs, visual novel, field notes, and support memberships.",
    websiteUrl: "https://www.parallaxhearts.org",
    primaryColor: "#2e394f",
    secondaryColor: "#10131a",
    accentColor: "#bd8d7a",
    notes: "Cinematic, rainy, archive-like creative lane.",
    socialProfiles: [
      {
        platform: "Facebook",
        handle: "ParallaxHearts",
        profileUrl: "https://www.facebook.com/ParallaxHearts",
        composerUrl: "https://www.facebook.com/ParallaxHearts",
        adminUrl: "https://business.facebook.com/",
        notes: "Readable page in logged-in Chrome context.",
      },
      {
        platform: "Website",
        handle: "parallaxhearts.org",
        profileUrl: "https://www.parallaxhearts.org",
        composerUrl: "https://www.parallaxhearts.org",
        adminUrl: "https://www.parallaxhearts.org",
        notes: "Music and story website.",
      },
    ],
  },
  "al-brothers": {
    businessType: "Contractor and home-services client brand",
    description: "Builder punch lists, drywall, paint, finish work, remodeling, and exterior repairs in Greenville and Upstate SC.",
    websiteUrl: "https://al-brothers.com",
    primaryColor: "#44515e",
    secondaryColor: "#f6f3ed",
    accentColor: "#c77937",
    notes: "Proof-of-work local SEO case study and client brand.",
    socialProfiles: [
      {
        platform: "Website",
        handle: "al-brothers.com",
        profileUrl: "https://al-brothers.com",
        composerUrl: "https://al-brothers.com",
        adminUrl: "https://al-brothers.com",
        notes: "Primary public destination.",
      },
      {
        platform: "Facebook",
        handle: "albrothersllc",
        profileUrl: "https://www.facebook.com/albrothersllc",
        composerUrl: "https://www.facebook.com/albrothersllc",
        adminUrl: "https://business.facebook.com/",
        notes: "Confirm page visibility before relying on it.",
      },
    ],
  },
};

export const seedBrands: Brand[] = brandConfigs.map((config) => {
  const meta = brandMeta[config.slug];
  return {
    slug: config.slug,
    name: config.name,
    businessType: meta.businessType,
    description: meta.description,
    positioning: config.positioning,
    audience: config.audience,
    offerSummary: config.offers.join(", "),
    voiceGuidelines: config.voice,
    forbiddenPhrases: config.forbiddenPhrases,
    visualStyle: config.visualStyle,
    primaryColor: meta.primaryColor,
    secondaryColor: meta.secondaryColor,
    accentColor: meta.accentColor,
    logoUrl: "",
    websiteUrl: meta.websiteUrl,
    defaultCTA: config.ctaOptions[0] || "Review and approve the next useful signal.",
    active: true,
    socialProfiles: meta.socialProfiles,
    primaryAudience: config.audience,
    voiceNotes: config.voice,
    defaultCta: config.ctaOptions[0] || "Review and approve the next useful signal.",
    notes: meta.notes,
  };
});

export const seedPlatforms: Platform[] = [
  {
    slug: "facebook",
    name: "Facebook",
    characterLimit: 63206,
    supportsHashtags: true,
    supportsAltText: true,
    supportsCarousel: true,
    supportsVideo: true,
    bestUseCase: "Conversational, community-oriented, trust-building posts.",
    active: true,
    maxLength: 63206,
    contentNotes: "Conversational, community-oriented, clear question or practical observation.",
    requiresTags: false,
  },
  {
    slug: "instagram",
    name: "Instagram",
    characterLimit: 2200,
    supportsHashtags: true,
    supportsAltText: true,
    supportsCarousel: true,
    supportsVideo: true,
    bestUseCase: "Visual, concise, save/share-friendly feed, stories, reels, and carousels.",
    active: true,
    maxLength: 2200,
    contentNotes: "Visual, concise, save/share-friendly, carousel or reel-ready.",
    requiresTags: true,
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    characterLimit: 3000,
    supportsHashtags: true,
    supportsAltText: true,
    supportsCarousel: true,
    supportsVideo: true,
    bestUseCase: "Authority-building for founders, operators, and professional audiences.",
    active: true,
    maxLength: 3000,
    contentNotes: "Authority-building, useful to founders, operators, and service businesses.",
    requiresTags: false,
  },
  {
    slug: "x",
    name: "X",
    characterLimit: 280,
    supportsHashtags: true,
    supportsAltText: true,
    supportsCarousel: false,
    supportsVideo: true,
    bestUseCase: "Sharp, quotable, concise posts and threads.",
    active: true,
    maxLength: 280,
    contentNotes: "Sharp, quotable, concise, easy to repost.",
    requiresTags: false,
  },
  {
    slug: "reddit",
    name: "Reddit",
    characterLimit: 40000,
    supportsHashtags: false,
    supportsAltText: false,
    supportsCarousel: false,
    supportsVideo: false,
    bestUseCase: "Discussion-first, non-promotional posts and useful replies.",
    active: true,
    maxLength: 40000,
    contentNotes: "Discussion-first, non-promotional, no hard CTA.",
    requiresTags: false,
  },
  {
    slug: "google-business-profile",
    name: "Google Business Profile",
    characterLimit: 1500,
    supportsHashtags: false,
    supportsAltText: false,
    supportsCarousel: false,
    supportsVideo: false,
    bestUseCase: "Local updates, proof-of-work photos, service-area visibility.",
    active: true,
    maxLength: 1500,
    contentNotes: "Local, proof-focused, concise business updates.",
    requiresTags: false,
  },
  {
    slug: "newsletter",
    name: "Newsletter",
    characterLimit: 1200,
    supportsHashtags: false,
    supportsAltText: false,
    supportsCarousel: false,
    supportsVideo: false,
    bestUseCase: "Weekly Signal Briefs and deeper repurposing.",
    active: true,
    maxLength: 1200,
    contentNotes: "Short Signal Brief section with a practical takeaway.",
    requiresTags: false,
  },
  {
    slug: "youtube",
    name: "YouTube",
    characterLimit: 5000,
    supportsHashtags: true,
    supportsAltText: false,
    supportsCarousel: false,
    supportsVideo: true,
    bestUseCase: "YouTube Studio content exports and video performance.",
    active: true,
    maxLength: 5000,
    contentNotes: "Video title, description, views, watch time, and engagement.",
    requiresTags: true,
  },
  {
    slug: "youtube-shorts",
    name: "YouTube Shorts",
    characterLimit: 1000,
    supportsHashtags: true,
    supportsAltText: false,
    supportsCarousel: false,
    supportsVideo: true,
    bestUseCase: "Short-form video scripts and descriptions.",
    active: true,
    maxLength: 1000,
    contentNotes: "Short visual script with clear one-idea structure.",
    requiresTags: true,
  },
  {
    slug: "tiktok",
    name: "TikTok",
    characterLimit: 2200,
    supportsHashtags: true,
    supportsAltText: false,
    supportsCarousel: true,
    supportsVideo: true,
    bestUseCase: "Short-form education, proof, and story fragments.",
    active: true,
    maxLength: 2200,
    contentNotes: "Quick hook, useful visual, concise caption.",
    requiresTags: true,
  },
  {
    slug: "kofi",
    name: "Ko-fi",
    characterLimit: 5000,
    supportsHashtags: false,
    supportsAltText: true,
    supportsCarousel: false,
    supportsVideo: true,
    bestUseCase: "Support updates, membership notes, creative progress.",
    active: true,
    maxLength: 5000,
    contentNotes: "Warm support update with a clear creative reason to care.",
    requiresTags: false,
  },
  {
    slug: "website",
    name: "Website",
    characterLimit: undefined,
    supportsHashtags: false,
    supportsAltText: false,
    supportsCarousel: false,
    supportsVideo: false,
    bestUseCase: "Website analytics, form submissions, and conversion CSVs.",
    active: true,
    maxLength: undefined,
    contentNotes: "Private analytics import source for lead and conversion context.",
    requiresTags: false,
  },
];

export const seedContentPillars: ContentPillar[] = brandConfigs.flatMap((config) =>
  config.contentPillars.map((slug) => ({
    brandSlug: config.slug,
    slug,
    name: slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    description: `${config.name} content pillar for ${slug.replace(/-/g, " ")}.`,
    examples: config.samplePostFormats,
    active: true,
  })),
);

export const seedCampaigns: Campaign[] = [
  {
    slug: "good-work-better-signal",
    brandSlug: "signal-workshop",
    name: "Good Work Better Signal",
    objective: "Clarify the umbrella positioning and connect business systems to daily visibility.",
    offer: "Signal Workshop systems review",
    primaryCTA: "Ask for a simple systems review.",
    status: "draft",
    notes: "Core umbrella campaign.",
  },
  {
    slug: "simple-systems-that-work",
    brandSlug: "signal-workshop",
    name: "Simple Systems That Work",
    objective: "Show practical business systems that can be maintained without full-time staff.",
    offer: "Business systems setup",
    primaryCTA: "Choose one system to simplify this week.",
    status: "draft",
    notes: "Operational proof campaign.",
  },
  {
    slug: "no-template-websites",
    brandSlug: "local-signal-websites",
    name: "No-Template Websites",
    objective: "Position Local Signal Websites around custom ownership and local clarity.",
    offer: "Custom website package",
    primaryCTA: "Run a free website audit.",
    status: "draft",
    notes: "Service and portfolio campaign.",
  },
  {
    slug: "website-clarity-week",
    brandSlug: "sitesignal",
    name: "Website Clarity Week",
    objective: "Use audit findings to create website improvement conversations.",
    offer: "SiteSignal audit",
    primaryCTA: "Start a free audit.",
    status: "draft",
    notes: "Diagnostic campaign.",
  },
  {
    slug: "vallen-dispatches",
    brandSlug: "parallax-hearts",
    name: "Vallen Dispatches",
    objective: "Warm the creative audience with field notes and story-world fragments.",
    offer: "Ko-fi support membership",
    primaryCTA: "Read the next field note.",
    status: "draft",
    notes: "Creative continuity campaign.",
  },
  {
    slug: "punch-list-closeout",
    brandSlug: "al-brothers",
    name: "Punch List Closeout",
    objective: "Show builder support, finish-work reliability, and local proof.",
    offer: "Punch list and finish work quote",
    primaryCTA: "Send the punch list.",
    status: "draft",
    notes: "Contractor proof campaign.",
  },
  {
    slug: "builder-trust",
    brandSlug: "al-brothers",
    name: "Builder Trust",
    objective: "Build local proof around jobsite communication and dependable closeout work.",
    offer: "Builder closeout support",
    primaryCTA: "Ask about closeout availability.",
    status: "draft",
    notes: "Local SEO and proof campaign.",
  },
  {
    slug: "business-signal-workshop-launch",
    brandSlug: "business-signal-workshop",
    name: "Business Signal Workshop Launch",
    objective: "Grow workshop authority and registration interest through decision filters.",
    offer: "Business Signal Workshop",
    primaryCTA: "Join the next workshop.",
    status: "draft",
    notes: "Workshop launch campaign.",
  },
];

function platformName(slug: string) {
  return seedPlatforms.find((platform) => platform.slug === slug)?.name || slug;
}

function brandName(slug: string) {
  return seedBrands.find((brand) => brand.slug === slug)?.name || slug;
}

function post(input: {
  id: string;
  date: string;
  brandSlug: string;
  platformSlug: string;
  campaign: string;
  contentPillarSlug: string;
  contentPillarName: string;
  objective: string;
  hook: string;
  body: string;
  cta: string;
  imageConcept: string;
  imagePrompt: string;
  altText: string;
  hashtags?: string;
  approvalStatus?: PostVariant["approvalStatus"];
  reviewNotes?: string;
}): PostVariant {
  return {
    ...input,
    brandName: brandName(input.brandSlug),
    platformName: platformName(input.platformSlug),
    hashtags: input.hashtags || "",
    assetFilename: generateAssetFilename({
      date: input.date,
      brandSlug: input.brandSlug,
      platformSlug: input.platformSlug,
      contentPillarSlug: input.contentPillarSlug,
      campaignSlug: input.campaign,
    }),
    approvalStatus: input.approvalStatus || "needs_review",
    publishingStatus: "not_scheduled",
    finalUrl: "",
    reviewNotes: input.reviewNotes || "Review before manual publishing.",
    metrics: emptyMetrics,
  };
}

export const seedPosts: PostVariant[] = [
  post({
    id: "post-2026-05-28-linkedin-signal",
    date: "2026-05-28",
    brandSlug: "signal-workshop",
    platformSlug: "linkedin",
    campaign: "good-work-better-signal",
    contentPillarSlug: "good-work-better-signal",
    contentPillarName: "Good Work Better Signal",
    objective: "Build authority and invite a useful conversation.",
    hook: "Good work deserves a better signal.",
    body:
      "Content gets easier when the business knows what it is trying to notice.\n\nA useful post starts with a real signal: a repeated customer question, a sales objection, a confusing metric, or a decision the audience keeps delaying.\n\nThe move this week is simple: pick one real question from the market and answer it clearly.",
    cta: "Save this and use one real audience question as tomorrow's post.",
    imageConcept: "Clean checklist graphic showing noise, signal, and next action.",
    imagePrompt:
      "Create a clean business operations graphic with three columns: noise, signal, next action. Minimal modern layout, high contrast, no clutter, no fake metrics.",
    altText: "A simple three-column framework showing noise, signal, and next action.",
  }),
  post({
    id: "post-2026-05-28-instagram-local",
    date: "2026-05-28",
    brandSlug: "local-signal-websites",
    platformSlug: "instagram",
    campaign: "no-template-websites",
    contentPillarSlug: "no-template-design",
    contentPillarName: "No Template Design",
    objective: "Make website ownership and clarity save-worthy.",
    hook: "A local website should answer four questions fast.",
    body:
      "What do you do?\nWhere do you serve?\nWhy should someone trust you?\nWhat happens next?\n\nDesign matters, but clarity does the first job.",
    cta: "Save this before your next homepage edit.",
    imageConcept: "Instagram carousel with four homepage clarity questions.",
    imagePrompt:
      "Create a 5-slide Instagram carousel for a local business homepage audit. Clean white panels, dark readable type, green accent, one question per slide, no stock photo feel.",
    altText: "A carousel outlining four questions every local business homepage should answer.",
    hashtags: "#smallbusinesswebsite #localseo #websitedesign",
  }),
  post({
    id: "post-2026-05-28-facebook-al-brothers",
    date: "2026-05-28",
    brandSlug: "al-brothers",
    platformSlug: "facebook",
    campaign: "punch-list-closeout",
    contentPillarSlug: "punch-list-education",
    contentPillarName: "Punch List Education",
    objective: "Build local contractor trust through practical education.",
    hook: "A punch list is not just a list of small things.",
    body:
      "It is the final trust step between the builder, the homeowner, and the work.\n\nClean closeout work protects the first impression, cuts down callbacks, and helps the project feel finished the right way.",
    cta: "Send the punch list when you need help closing it out.",
    imageConcept: "Straightforward jobsite checklist graphic for closeout items.",
    imagePrompt:
      "Create a practical contractor checklist graphic for punch list closeout. Neutral jobsite colors, strong hierarchy, no invented project photos, builder-friendly tone.",
    altText: "A contractor punch list closeout checklist graphic.",
  }),
];
