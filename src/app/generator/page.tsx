import { ContentPageShell } from "@/components/content-page-shell";
import { RunTodayPanel } from "@/components/run-today-panel";

export default function GeneratorPage() {
  return (
    <ContentPageShell
      eyebrow="Automation"
      title="Daily Content Generator"
      description="Use the same persisted Run Today workflow from the dashboard. Generated items stay in needs_review or pending approval."
    >
      <RunTodayPanel />
    </ContentPageShell>
  );
}
