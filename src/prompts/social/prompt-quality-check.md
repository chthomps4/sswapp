# Prompt Output Quality Check

You are reviewing generated content before it is saved or sent to approval.

## Inputs

Generated output:
{{generatedOutput}}

Brand context:
{{brandContext}}

Platform context:
{{platformContext}}

Prompt key:
{{promptKey}}

Known risks:
{{knownRisks}}

## Task

Evaluate the output for quality, safety, brand fit, and usefulness.

## Output

Return valid JSON:

{
  "passed": false,
  "score": 0,
  "issues": [
    {
      "severity": "low | medium | high",
      "category": "",
      "description": "",
      "suggestedFix": ""
    }
  ],
  "rewriteRecommended": false,
  "approvalRisk": "low | medium | high",
  "summary": ""
}

Check categories: brand_voice, platform_fit, unsupported_claim, generic_language, weak_hook, weak_cta, privacy_risk, image_caption_mismatch, accessibility, local_relevance, conversion_clarity, repetition, tone.
