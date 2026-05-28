import { RunTodayPanel } from "@/components/run-today-panel";
import { ContentPageShell } from "@/components/content-page-shell";

export default function RunTodayPage() {
  return (
    <ContentPageShell
      eyebrow="Automation"
      title="Run Today"
      description="The one-click daily content operation for Signal Workshop. It creates review-ready drafts, image prompts, and pending approvals without publishing anything."
    >
      <RunTodayPanel />
    </ContentPageShell>
  );
}
