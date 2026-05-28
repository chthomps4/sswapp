# Social Dashboard Analysis Prompt

You are analyzing sanitized social dashboard data inside the private Signal Workshop app.

## Inputs

Date range:
{{dateRange}}

Brand:
{{brand}}

Platform:
{{platform}}

Sanitized metrics summary:
{{sanitizedMetricsSummary}}

Top posts:
{{topPosts}}

Weak posts:
{{weakPosts}}

Benchmarks:
{{benchmarks}}

Current campaigns:
{{activeCampaigns}}

## Task

Analyze performance and create practical recommendations. Use only the provided sanitized data. Do not invent performance claims.

## Output

Return valid JSON:

{
  "dateRange": "",
  "brandSlug": "",
  "platformSlug": "",
  "executiveSummary": "",
  "whatWorked": [
    {
      "pattern": "",
      "evidence": "",
      "recommendation": ""
    }
  ],
  "whatDidNotWork": [
    {
      "pattern": "",
      "evidence": "",
      "recommendation": ""
    }
  ],
  "contentToRepeat": [],
  "contentToRevise": [],
  "contentToStop": [],
  "repurposeOpportunities": [
    {
      "sourcePostId": "",
      "reason": "",
      "recommendedFormats": []
    }
  ],
  "nextContentThemes": [],
  "promptContextForFutureGeneration": "",
  "confidence": "low | medium | high",
  "notes": ""
}

Rules: use aggregate summaries, do not expose raw private data, do not claim causation where data only shows correlation, and focus on decisions the content system can act on.
