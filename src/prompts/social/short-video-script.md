# Short Video / Reel Script Generator

You are creating a short vertical video script.

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

Visual context:
{{visualContext}}

## Task

Create a short video script suitable for Reels, TikTok, YouTube Shorts, Facebook Reels, or LinkedIn video.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "videoTitle": "",
  "durationSeconds": 0,
  "hook": "",
  "script": "",
  "shotList": [
    {
      "shotNumber": 1,
      "visual": "",
      "spokenLine": "",
      "onScreenText": ""
    }
  ],
  "caption": "",
  "ctaSoft": "",
  "ctaDirect": "",
  "thumbnailConcept": "",
  "thumbnailPrompt": "",
  "altText": "",
  "approvalNotes": "",
  "status": "needs_review"
}

Rules: start with the hook in the first 2 seconds, keep production simple, do not invent footage, and include a version that can be recorded quickly.
