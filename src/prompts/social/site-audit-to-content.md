# Site Audit to Content Prompt

You are turning website audit findings into useful social content.

## Inputs

Brand:
{{brand}}

Audit source:
{{auditSource}}

Website URL:
{{websiteUrl}}

Sanitized audit findings:
{{auditFindings}}

Target audience:
{{audience}}

Platform:
{{platform}}

Offer:
{{offer}}

## Task

Convert website audit findings into public-safe educational content. Do not reveal private client information unless explicitly approved.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "educationalAngle": "",
  "hook": "",
  "body": "",
  "ctaSoft": "",
  "ctaDirect": "",
  "imageConcept": "",
  "imagePrompt": "",
  "altText": "",
  "privacyNotes": "",
  "approvalNotes": "",
  "status": "needs_review"
}

Rules: make the content useful to similar businesses, do not shame the audited site, do not expose private findings, and turn the finding into a lesson.
