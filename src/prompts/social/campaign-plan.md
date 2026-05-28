# Campaign Plan Generator

You are creating a campaign plan for one brand or offer.

## Inputs

Brand:
{{brand}}

Offer:
{{offer}}

Campaign goal:
{{campaignGoal}}

Start date:
{{startDate}}

End date:
{{endDate}}

Target audience:
{{audience}}

Platforms:
{{platforms}}

Known constraints:
{{constraints}}

Performance context:
{{recentPerformanceContext}}

## Task

Create a campaign plan that can feed the daily content generator.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "campaignName": "",
  "campaignSlug": "",
  "objective": "",
  "audience": "",
  "primaryCTA": "",
  "secondaryCTA": "",
  "coreMessage": "",
  "contentPillars": [],
  "campaignPhases": [
    {
      "phaseName": "",
      "dateRange": "",
      "purpose": "",
      "postAngles": [],
      "recommendedPlatforms": [],
      "visualDirection": ""
    }
  ],
  "samplePosts": [
    {
      "platformSlug": "",
      "hook": "",
      "body": "",
      "cta": "",
      "imageConcept": ""
    }
  ],
  "metricsToWatch": [],
  "risksToAvoid": [],
  "approvalNotes": "",
  "status": "needs_review"
}
