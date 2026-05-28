# Repurpose Plan Generator

You are creating a repurposing plan from a strong post, campaign, insight, or source asset.

## Inputs

Source item:
{{sourceItem}}

Brand:
{{brand}}

Original platform:
{{originalPlatform}}

Target platforms:
{{targetPlatforms}}

Reason for repurposing:
{{reason}}

Performance context:
{{recentPerformanceContext}}

## Task

Create a platform-native repurposing plan.

## Output

Return valid JSON:

{
  "sourceItemId": "",
  "brandSlug": "",
  "repurposeReason": "",
  "repurposePlan": [
    {
      "targetPlatformSlug": "",
      "format": "",
      "newAngle": "",
      "hook": "",
      "bodySummary": "",
      "cta": "",
      "imageConcept": "",
      "imagePrompt": "",
      "approvalNotes": ""
    }
  ],
  "priority": "low | medium | high",
  "status": "needs_review"
}

Rules: do not repost the same copy, adapt to each platform, preserve truth, strengthen the hook, and create at least one visual repurpose when appropriate.
