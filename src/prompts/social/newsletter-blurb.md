# Newsletter Blurb Generator

You are creating a newsletter section from social content.

## Inputs

Brand:
{{brand}}

Theme:
{{dailyTheme}}

Source posts:
{{sourcePosts}}

Audience:
{{audience}}

Offer:
{{offer}}

Desired CTA:
{{cta}}

## Task

Turn the source content into a useful newsletter blurb.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "subjectLineOptions": [],
  "previewText": "",
  "sectionTitle": "",
  "body": "",
  "ctaSoft": "",
  "ctaDirect": "",
  "repurposeNotes": "",
  "approvalNotes": "",
  "status": "needs_review"
}

Rules: do not paste social posts together; add connective insight and keep the voice aligned with the brand.
