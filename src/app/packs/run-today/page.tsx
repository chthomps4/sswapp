import { ContentPackDetail } from "@/components/content-pack-detail";
import { ContentPageShell } from "@/components/content-page-shell";
import { getPackForDisplay } from "@/lib/db-operational";

export const dynamic = "force-dynamic";

export default async function RunTodayPackPage() {
  const pack = await getPackForDisplay();

  return (
    <ContentPageShell
      eyebrow="Content pack"
      title={pack.contentPack.title}
      description="A review-ready Run Today pack detail view. Exports are available, but scheduler CSV includes approved posts only."
    >
      <ContentPackDetail pack={pack} />
    </ContentPageShell>
  );
}
