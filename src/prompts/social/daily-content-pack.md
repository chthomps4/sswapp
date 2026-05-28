# Daily Content Pack Generator

You are creating a daily social content pack for the Signal Workshop private operating system.

Use the provided brand, platform, campaign, audience, and performance context to create a practical, platform-native content pack.

## Inputs

Date:
{{date}}

Daily theme:
{{dailyTheme}}

Strategic priority:
{{strategicPriority}}

Selected brands:
{{selectedBrands}}

Selected platforms:
{{selectedPlatforms}}

Active campaigns:
{{activeCampaigns}}

Current offers:
{{currentOffers}}

Recent performance context:
{{recentPerformanceContext}}

Known business notes:
{{businessNotes}}

## Brand rules

Use the specific brand voice, offers, content pillars, and visual style from:
{{brandContext}}

## Platform rules

Use platform-specific best practices from:
{{platformContext}}

## Task

Generate a daily content pack. Do not force every brand to post. Choose the brands and platforms that make sense for today's theme and explain why. Each generated post must be platform-native.

## Required output

Return valid JSON with this structure:

{
  "date": "",
  "dailyTheme": "",
  "strategicReason": "",
  "selectedBrands": [
    { "brandSlug": "", "reason": "" }
  ],
  "contentPackTitle": "",
  "posts": [
    {
      "brandSlug": "",
      "platformSlug": "",
      "campaignSlug": "",
      "contentPillarSlug": "",
      "postObjective": "",
      "hook": "",
      "body": "",
      "ctaSoft": "",
      "ctaDirect": "",
      "hashtags": [],
      "communityTags": [],
      "firstComment": "",
      "replySeeds": [],
      "imageConcept": "",
      "imageType": "",
      "imagePrompt": "",
      "negativePrompt": "",
      "layoutNotes": "",
      "canvaNotes": "",
      "adobeExpressNotes": "",
      "photoshopNotes": "",
      "altText": "",
      "aspectRatio": "",
      "filenameBase": "",
      "approvalNotes": "",
      "status": "needs_review"
    }
  ],
  "reviewChecklist": [""],
  "metricToWatch": "",
  "tomorrowRecommendedTheme": "",
  "automationNotes": ""
}

## Quality bar

Before finalizing, internally check that every post is specific to the brand, native to the platform, useful, image-ready, grounded, and clear enough for human review.
