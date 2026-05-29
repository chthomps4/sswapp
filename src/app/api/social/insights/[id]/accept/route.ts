import { SocialInsightStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireOwnerResponse } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db-operational";
import { prisma } from "@/lib/prisma";
import { createSampleSocialImport } from "@/lib/social-dashboard-engine";
import { slugify } from "@/lib/utils";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireOwnerResponse();
  if (denied) return denied;
  const { id } = await context.params;
  if (isDatabaseConfigured()) {
    try {
      const insight = await prisma.socialPerformanceInsight.update({
        where: { id },
        data: { status: SocialInsightStatus.ACCEPTED },
      });
      const contentTheme = await prisma.contentTheme.create({
        data: {
          title: insight.title,
          description: insight.recommendation,
          angle: insight.summary,
          source: "social-performance-insight",
          priority: insight.priority,
          recommendedBrands: insight.brandId ? [insight.brandId] : [],
        },
      });
      return NextResponse.json({ insight, contentTheme });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return NextResponse.json({ message: "Social insight not found." }, { status: 404 });
      }
      return NextResponse.json({ message: "Social insight could not be accepted." }, { status: 400 });
    }
  }
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
