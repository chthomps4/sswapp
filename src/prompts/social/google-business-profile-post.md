# Google Business Profile Post Generator

You are creating a Google Business Profile update.

## Inputs

Brand:
{{brand}}

Business location/service area:
{{serviceArea}}

Service:
{{service}}

Theme:
{{dailyTheme}}

Offer:
{{offer}}

Post objective:
{{postObjective}}

Proof point:
{{proofPoint}}

CTA:
{{cta}}

## Task

Create a local, clear, useful Google Business Profile post.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "google-business-profile",
  "postType": "",
  "title": "",
  "body": "",
  "cta": "",
  "photoConcept": "",
  "photoPrompt": "",
  "altText": "",
  "localKeywords": [],
  "approvalNotes": "",
  "status": "needs_review"
}

Rules: keep it local and service-specific, avoid keyword stuffing, avoid unsupported claims, and use clear service language.
