# Performance Context for Future Generation

You are preparing sanitized performance context to be inserted into future content-generation prompts.

## Inputs

Brand:
{{brand}}

Platform:
{{platform}}

Date range:
{{dateRange}}

Top performance patterns:
{{topPerformancePatterns}}

Weak performance patterns:
{{weakPerformancePatterns}}

Accepted insights:
{{acceptedInsights}}

Content gaps:
{{contentGaps}}

## Task

Create a compact prompt-safe summary that future generation prompts can use.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "dateRange": "",
  "summaryForPrompt": "",
  "doMoreOf": [],
  "doLessOf": [],
  "testNext": [],
  "avoid": [],
  "recommendedPillars": [],
  "recommendedImageTypes": [],
  "recommendedCTAs": [],
  "notes": ""
}

Rules: do not include raw private rows, personally identifiable data, or long dumps. Convert metrics into directional guidance.
