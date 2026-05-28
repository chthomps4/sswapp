import { z } from "zod";

export const dailyPackInputSchema = z.object({
  date: z.string().optional(),
  theme: z.string().min(3).default("Signal over noise"),
  dailyTheme: z.string().optional(),
  brandSlug: z.string().optional(),
  selectedBrands: z.array(z.string()).optional(),
  selectedPlatforms: z.array(z.string()).optional(),
  offer: z.string().optional(),
  audiencePriority: z.string().optional(),
  campaign: z.string().optional(),
  strategicPriority: z.string().optional(),
  recentPerformanceNotes: z.string().optional(),
  researchBrief: z.string().optional(),
  postCount: z.number().int().positive().max(25).optional(),
  includeImagePrompts: z.boolean().optional(),
  includeCarouselOutlines: z.boolean().optional(),
  includeRedditVersions: z.boolean().optional(),
  includeGoogleBusinessProfile: z.boolean().optional(),
});

export const statusPatchSchema = z.object({
  status: z.enum(["draft", "needs_review", "approved", "needs_revision", "scheduled", "posted", "skipped", "archived"]),
  reviewer: z.string().optional(),
  notes: z.string().optional(),
});

export const metricsImportSchema = z.object({
  csv: z.string().min(1),
});
