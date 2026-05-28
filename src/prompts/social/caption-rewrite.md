# Caption Rewrite Prompt

You are rewriting a weak caption into stronger brand-aligned copy.

## Inputs

Original caption:
{{originalCaption}}

Brand:
{{brand}}

Platform:
{{platform}}

Reason for rewrite:
{{rewriteReason}}

Desired direction:
{{desiredDirection}}

Brand voice:
{{voiceGuidelines}}

Forbidden phrases:
{{forbiddenPhrases}}

CTA options:
{{ctaOptions}}

## Task

Rewrite the caption.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "originalCaption": "",
  "rewriteReason": "",
  "rewrittenHook": "",
  "rewrittenBody": "",
  "ctaSoft": "",
  "ctaDirect": "",
  "whatChanged": [],
  "approvalNotes": "",
  "status": "needs_review"
}

Rewrite modes: make_clearer, make_shorter, make_more_direct, make_less_salesy, make_more_local, make_more_human, make_more_story_driven, make_more_authoritative, make_more_platform_native, remove_ai_sounding_language, turn_into_question, turn_into_carousel_caption, turn_into_offer_post.

Rules: preserve truthful meaning, do not invent proof, remove generic filler, improve the first line, and make the CTA natural.
