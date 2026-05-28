import OpenAI from "openai";
import type { DailyPackInput, GeneratedPost } from "./types";
import { buildFallbackDailyPack } from "./content-engine";
import { renderPrompt } from "./prompt-renderer";

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const dailyPackSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    posts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          date: { type: "string" },
          brandSlug: { type: "string" },
          brandName: { type: "string" },
          platformSlug: { type: "string" },
          platformName: { type: "string" },
          campaign: { type: "string" },
          contentPillarSlug: { type: "string" },
          contentPillarName: { type: "string" },
          objective: { type: "string" },
          hook: { type: "string" },
          body: { type: "string" },
          cta: { type: "string" },
          imageConcept: { type: "string" },
          imagePrompt: { type: "string" },
          altText: { type: "string" },
          hashtags: { type: "string" },
          assetFilename: { type: "string" },
        },
        required: [
          "date",
          "brandSlug",
          "brandName",
          "platformSlug",
          "platformName",
          "campaign",
          "contentPillarSlug",
          "contentPillarName",
          "objective",
          "hook",
          "body",
          "cta",
          "imageConcept",
          "imagePrompt",
          "altText",
          "hashtags",
          "assetFilename",
        ],
      },
    },
  },
  required: ["posts"],
};

export async function generateDailyPack(input: DailyPackInput): Promise<{
  mode: "openai" | "fallback";
  posts: GeneratedPost[];
  error?: string;
}> {
  const fallback = buildFallbackDailyPack(input);
  const openai = getOpenAIClient();
  if (!openai) return { mode: "fallback", posts: fallback, error: "OPENAI_API_KEY is not configured." };

  try {
    const response = (await openai.responses.create({
      model: process.env.OPENAI_MODEL_TEXT || process.env.OPENAI_MODEL || "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You generate review-ready, platform-native social posts for an internal content operations app. Never auto-publish. Avoid generic AI wording, hype, fake urgency, and engagement bait.",
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "daily_social_pack",
          strict: true,
          schema: dailyPackSchema,
        },
      },
    })) as unknown as { output_text?: string };

    const parsed = JSON.parse(response.output_text || "{}") as { posts?: GeneratedPost[] };
    if (!parsed.posts?.length) return { mode: "fallback", posts: fallback, error: "OpenAI returned no posts." };
    return { mode: "openai", posts: parsed.posts };
  } catch (error) {
    return {
      mode: "fallback",
      posts: fallback,
      error: error instanceof Error ? error.message : "OpenAI generation failed.",
    };
  }
}

async function generateText({
  templateName,
  variables,
  fallback,
}: {
  templateName: string;
  variables: Record<string, string | string[] | undefined>;
  fallback: string;
}) {
  const openai = getOpenAIClient();
  const prompt = await renderPrompt(templateName, variables);
  if (!openai) return { mode: "fallback" as const, text: fallback, error: "OPENAI_API_KEY is not configured." };

  try {
    const response = (await openai.responses.create({
      model: process.env.OPENAI_MODEL_TEXT || process.env.OPENAI_MODEL || "gpt-5.1",
      input: [
        {
          role: "system",
          content:
            "You support an internal Signal Workshop social operations app. Create review-ready drafts only. Never imply publishing has happened.",
        },
        { role: "user", content: prompt },
      ],
    })) as unknown as { output_text?: string };

    return { mode: "openai" as const, text: response.output_text || fallback };
  } catch (error) {
    return {
      mode: "fallback" as const,
      text: fallback,
      error: error instanceof Error ? error.message : "OpenAI generation failed.",
    };
  }
}

export async function generatePlatformPost(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "platform-post",
    variables,
    fallback: "Draft a useful platform-native post with one signal, one practical takeaway, and a human-review CTA.",
  });
}

export async function generateImagePrompt(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "image-prompt",
    variables,
    fallback:
      "Create a clear social graphic that explains the post's main signal with readable type, strong hierarchy, alt text, and no generic stock-photo feel.",
  });
}

export async function generateCarouselOutline(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "carousel-outline",
    variables,
    fallback: "Create a 5-slide carousel: problem, signal, mistake, practical fix, and next step.",
  });
}

export async function generateWeeklyResearchBrief(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "weekly-research-brief",
    variables,
    fallback: "Summarize top audience signals, post ideas, offer angles, visual concepts, and tomorrow's generation instructions.",
  });
}

export async function analyzeMetrics(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "metrics-analysis",
    variables,
    fallback: "Repeat the strongest trust-building formats, revise unclear pillars, and stop angles that create no saves, clicks, DMs, or leads.",
  });
}

export async function rewriteCaption(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "caption-rewrite",
    variables,
    fallback: "Rewrite the caption with a sharper hook, one useful signal, one practical takeaway, and one review-ready CTA.",
  });
}

export async function generateAltText(variables: Record<string, string | string[] | undefined>) {
  return generateText({
    templateName: "image-prompt",
    variables,
    fallback: "Alt text should describe the visual content and the business idea without stuffing keywords.",
  });
}
