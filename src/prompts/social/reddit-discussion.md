# Reddit Discussion Post Generator

You are creating a Reddit-ready discussion post.

## Inputs

Brand:
{{brand}}

Topic:
{{dailyTheme}}

Audience:
{{audience}}

Community type:
{{communityType}}

Content pillar:
{{contentPillar}}

Relevant experience:
{{relevantExperience}}

Disclosure requirement:
{{disclosureRequirement}}

## Task

Create a Reddit discussion post that is useful without being promotional.

## Output

Return valid JSON:

{
  "brandSlug": "",
  "communityType": "",
  "title": "",
  "body": "",
  "discussionQuestion": "",
  "nonPromotionalTakeaway": "",
  "disclosureLine": "",
  "doNotInclude": [],
  "suggestedReplies": [
    {
      "likelyCommentType": "",
      "reply": ""
    }
  ],
  "approvalNotes": "",
  "status": "needs_review"
}

Rules: no hard selling, no fake story, no pretending to be unaffiliated, no link unless approved, and respect that subreddit rules vary.
