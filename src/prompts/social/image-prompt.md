# Image Prompt Generator

You are creating an image prompt and design instructions for a social post.

## Inputs

Brand:
{{brand}}

Platform:
{{platform}}

Post:
{{post}}

Content pillar:
{{contentPillar}}

Campaign:
{{campaign}}

Visual style:
{{visualStyle}}

Image style rules:
{{imageStyleRules}}

Forbidden visual elements:
{{forbiddenVisualElements}}

Asset filename format:
{{assetFilenameFormat}}

## Task

Create an image concept, image-generation prompt, design notes, alt text, and filename base. The image should clarify the idea, not merely decorate the post.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "imageType": "",
  "headlineText": "",
  "supportingText": "",
  "imageConcept": "",
  "prompt": "",
  "negativePrompt": "",
  "layoutNotes": "",
  "canvaNotes": "",
  "adobeExpressNotes": "",
  "photoshopNotes": "",
  "altText": "",
  "aspectRatio": "",
  "filenameBase": "",
  "approvalNotes": "",
  "status": "needs_review"
}

Use one imageType: quote_card, carousel, checklist, diagram, data_style_graphic, screenshot_mockup, founder_note, workshop_promo, before_after, field_note, album_story_visual, jobsite_before_after, google_business_photo_post, text_only_no_image_needed.

Brand visual guidance:
- Signal Workshop: clean, structured, useful, modern, minimal, businesslike, warm but not slick.
- Business Signal Workshop: diagnostic, framework-driven, clean diagrams, decision filters, signal/noise contrast.
- Local Signal Websites: website screenshots, layout frames, before/after clarity, local business visuals, clean code/design cues.
- SiteSignal: audit-style, diagnostic, scorecard, issue list, website signal map, technical clarity.
- Parallax Hearts: rainy town, dim windows, old houses, rail lines, station rooms, paper archive, muted blue-gray, charcoal, sepia, warm interior light. Cinematic but not horror or fantasy spectacle.
- AL Brothers: real jobsite, finish work, drywall/paint, before/after, clean repairs, builder handoff, local contractor trust. Avoid fake luxury construction imagery.

Rules: avoid clutter, tiny text, fake data charts, misleading before/after images, unsafe jobsite practices, and generic stock photo energy.
