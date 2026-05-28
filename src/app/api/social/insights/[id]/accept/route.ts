import { NextResponse } from "next/server";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";
import { slugify } from "@/lib/utils";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sample = createSampleSocialImport();
  const insight = sample.insights.find((item) => item.id === id) || sample.insights[0];

  return NextResponse.json({
    insight: { ...insight, status: "accepted" },
    contentTheme: {
      id: `theme-${slugify(insight.title)}`,
      title: insight.title,
      description: insight.recommendation,
      angle: insight.summary,
      source: "social-performance-insight",
      priority: insight.priority,
      recommendedBrands: insight.brandSlug ? [insight.brandSlug] : [],
    },
  });
}
