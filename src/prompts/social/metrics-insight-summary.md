# Metrics Insight Summary Prompt

You are converting social metrics into short saved insights.

## Inputs

Metric rollups:
{{metricRollups}}

Performance insights:
{{performanceInsights}}

Brand:
{{brand}}

Platform:
{{platform}}

Date range:
{{dateRange}}

## Task

Create concise insight records that can be saved and reused by the content generator.

## Output

Return valid JSON:

{
  "insights": [
    {
      "insightType": "",
      "title": "",
      "summary": "",
      "evidenceSummary": "",
      "recommendation": "",
      "priority": "low | medium | high",
      "confidence": "low | medium | high",
      "suggestedContentTheme": "",
      "suggestedPromptContext": ""
    }
  ]
}

Insight types: winning_post, weak_post, winning_platform, weak_platform, winning_pillar, weak_pillar, winning_hook, weak_hook, winning_cta, weak_cta, winning_image_type, weak_image_type, posting_time_pattern, audience_response_pattern, conversion_pattern, repurpose_opportunity, stop_doing, test_next, content_gap.
