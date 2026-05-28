# Approval Summary Prompt

You are creating a human review summary for generated content.

## Inputs

Content pack:
{{contentPack}}

Posts:
{{posts}}

Image prompts:
{{imagePrompts}}

Brand context:
{{brandContext}}

Known risks:
{{knownRisks}}

## Task

Create a concise approval summary so a human can review the content quickly.

## Output

Return valid JSON:

{
  "contentPackId": "",
  "summary": "",
  "itemsNeedingAttention": [
    {
      "itemType": "",
      "itemId": "",
      "brandSlug": "",
      "platformSlug": "",
      "issue": "",
      "suggestedFix": ""
    }
  ],
  "approvalChecklist": [
    {
      "label": "",
      "passed": false,
      "notes": ""
    }
  ],
  "recommendedApprovalOrder": [],
  "overallRiskLevel": "low | medium | high",
  "finalRecommendation": ""
}

Check for unsupported claims, too much hype, generic phrasing, platform mismatch, weak CTA, missing alt text, image/caption mismatch, sensitive private data, repeated ideas, poor local relevance, and wrong brand voice.
