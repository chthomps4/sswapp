# Monthly Content Map Generator

You are creating a monthly content map for the Signal Workshop umbrella.

## Inputs

Month:
{{month}}

Brands:
{{brands}}

Campaigns:
{{campaigns}}

Offers:
{{offers}}

Posting frequency rules:
{{postingFrequencyRules}}

Performance context:
{{recentPerformanceContext}}

Business priorities:
{{businessPriorities}}

Known dates:
{{knownDates}}

## Task

Create a balanced monthly content map. Do not make every brand post every day. Prioritize strategic rhythm and sustainable execution.

## Output

Return valid JSON:

{
  "month": "",
  "monthlyTheme": "",
  "strategicSummary": "",
  "weeklyThemes": [
    {
      "weekNumber": 1,
      "theme": "",
      "priorityBrands": [],
      "primaryCampaign": "",
      "notes": ""
    }
  ],
  "calendar": [
    {
      "date": "",
      "recommendedBrand": "",
      "platforms": [],
      "theme": "",
      "contentPillar": "",
      "postObjective": "",
      "cta": "",
      "imageDirection": "",
      "status": "planned"
    }
  ],
  "contentBalanceNotes": "",
  "risksToAvoid": [],
  "metricsToWatch": []
}
