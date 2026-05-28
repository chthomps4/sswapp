# Carousel Outline Generator

You are creating a carousel outline for Instagram or LinkedIn.

## Inputs

Brand:
{{brand}}

Platform:
{{platform}}

Theme:
{{dailyTheme}}

Content pillar:
{{contentPillar}}

Post objective:
{{postObjective}}

Audience:
{{audience}}

Offer:
{{offer}}

Brand voice:
{{voiceGuidelines}}

Visual style:
{{visualStyle}}

## Task

Create a 5-8 slide carousel outline. Each slide must have one clear idea. Do not overload slides with text.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "carouselTitle": "",
  "slideCount": 0,
  "slides": [
    {
      "slideNumber": 1,
      "headline": "",
      "body": "",
      "visualDirection": "",
      "speakerNote": ""
    }
  ],
  "caption": "",
  "ctaSoft": "",
  "ctaDirect": "",
  "imagePrompt": "",
  "altText": "",
  "approvalNotes": "",
  "status": "needs_review"
}

Rules: slide 1 must be a strong hook, the final slide must create a next action, and the carousel should be saveable or shareable.
