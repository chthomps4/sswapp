# Weekly Content Intelligence Brief

You are creating a weekly content intelligence brief for the Signal Workshop umbrella.

## Inputs

Week start:
{{weekStart}}

Week end:
{{weekEnd}}

Brand context:
{{brandContext}}

Current offers:
{{currentOffers}}

Active campaigns:
{{activeCampaigns}}

Recent performance context:
{{recentPerformanceContext}}

Audience notes:
{{audienceNotes}}

Competitor or market notes:
{{marketNotes}}

## Task

Create a weekly content direction brief.

## Output

Return valid JSON:

{
  "weekStart": "",
  "weekEnd": "",
  "executiveSummary": "",
  "topSignals": [],
  "contentOpportunities": [
    {
      "brandSlug": "",
      "opportunity": "",
      "reason": "",
      "recommendedPlatforms": [],
      "suggestedPostAngles": []
    }
  ],
  "risksToAvoid": [],
  "recommendedCampaignFocus": "",
  "sevenDayPlan": [
    {
      "day": "",
      "date": "",
      "recommendedBrand": "",
      "theme": "",
      "platforms": [],
      "primaryCTA": "",
      "imageDirection": ""
    }
  ],
  "promptInstructionsForDailyGenerator": "",
  "approvalNotes": ""
}

Rules: prioritize useful content over volume, do not force every brand every day, and include offer support, trust building, and repurposing opportunities.
