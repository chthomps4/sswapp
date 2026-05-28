import { notFound } from "next/navigation";
import { ContentPackDetail } from "@/components/content-pack-detail";
import { ContentPageShell } from "@/components/content-page-shell";
import { getPackForDisplay, isDatabaseConfigured } from "@/lib/db-operational";

export const dynamic = "force-dynamic";

export default async function ContentPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDatabaseConfigured() && id !== "run-today" && id !== "sample") notFound();
  const pack = await getPackForDisplay(id);
  if (isDatabaseConfigured() && pack.contentPack.id !== id) notFound();

  return (
    <ContentPageShell
      eyebrow="Content pack"
      title={pack.contentPack.title}
      description="Persisted content pack with draft copy, image prompts, approval records, and approved-only exports."
    >
      <ContentPackDetail pack={pack} />
    </ContentPageShell>
  );
}
