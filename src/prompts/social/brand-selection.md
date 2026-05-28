# Daily Brand Selection Prompt

You are deciding which Signal Workshop umbrella brands should post today.

## Inputs

Date:
{{date}}

Daily theme:
{{dailyTheme}}

Business priorities:
{{businessPriorities}}

Brand context:
{{brandContext}}

Active campaigns:
{{activeCampaigns}}

Recent performance context:
{{recentPerformanceContext}}

Posting frequency rules:
{{postingFrequencyRules}}

## Task

Choose which brands should post today. Do not force every brand to post. Select based on strategic priority, active campaign timing, content freshness, recent performance, theme fit, quiet brands, and whether there is a strong CTA or story reason to post.

## Output

Return valid JSON:

{
  "date": "",
  "dailyTheme": "",
  "recommendedBrands": [
    {
      "brandSlug": "",
      "shouldPost": true,
      "priority": "high | medium | low",
      "reason": "",
      "recommendedPlatforms": [],
      "recommendedAngle": "",
      "recommendedCTA": ""
    }
  ],
  "brandsToSkip": [
    { "brandSlug": "", "reason": "" }
  ],
  "overallRecommendation": ""
}
