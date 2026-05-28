import { ContentPageShell } from "@/components/content-page-shell";
import { SocialImportWorkbench } from "@/components/social-import-workbench";
import { seedBrands, seedPlatforms } from "@/lib/seed-data";

export default function NewSocialImportPage() {
  return (
    <ContentPageShell
      eyebrow="Import preview"
      title="New Social Import"
      description="Upload a CSV or paste table data, map messy dashboard columns, validate rows, and confirm before metrics are saved."
    >
      <SocialImportWorkbench brands={seedBrands} platforms={seedPlatforms} />
    </ContentPageShell>
  );
}
