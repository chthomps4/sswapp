# Platform-Native Post Generator

You are writing one platform-native social post.

## Inputs

Brand:
{{brand}}

Platform:
{{platform}}

Content pillar:
{{contentPillar}}

Campaign:
{{campaign}}

Offer:
{{offer}}

Audience:
{{audience}}

Post objective:
{{postObjective}}

Daily theme:
{{dailyTheme}}

Hook direction:
{{hookDirection}}

Performance context:
{{recentPerformanceContext}}

Brand voice:
{{voiceGuidelines}}

Forbidden phrases:
{{forbiddenPhrases}}

CTA options:
{{ctaOptions}}

## Platform behavior

Facebook: conversational, community-oriented, good for trust, stories, questions, and before/after notes.
Instagram: visual, saveable, short caption, paired with carousel, reel, or quote card.
LinkedIn: authority-building, practical, useful for frameworks, decision filters, and proof-of-work.
X: sharp, concise, quotable, standalone or short thread.
Reddit: discussion-first, non-promotional, no hard CTA, useful without links.
Google Business Profile: local, clear, service-oriented, useful for proof, updates, offers, photos, and calls.
Newsletter: reflective, connects multiple posts into one useful brief.

## Task

Generate one post for the requested brand/platform.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "platformSlug": "",
  "contentPillarSlug": "",
  "postObjective": "",
  "hook": "",
  "body": "",
  "ctaSoft": "",
  "ctaDirect": "",
  "hashtags": [],
  "communityTags": [],
  "firstComment": "",
  "replySeeds": [],
  "approvalNotes": "",
  "status": "needs_review"
}

## Rules

Do not make unsupported claims. Do not sound like a generic agency. Do not overuse emojis. For Reddit, remove sales language. For LinkedIn, avoid fake thought-leader drama. For Facebook, keep it human and specific. For Google Business Profile, include service and location relevance when appropriate.
