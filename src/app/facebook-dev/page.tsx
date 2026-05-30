import { ContentPageShell } from "@/components/content-page-shell";
import { FacebookDevPanel } from "@/components/facebook-dev-panel";
import { getFacebookRuntimeState } from "@/lib/facebook-runtime";

export const dynamic = "force-dynamic";

export default function FacebookDevPage() {
  const facebook = getFacebookRuntimeState();

  return (
    <ContentPageShell
      eyebrow="Integration setup"
      title="Facebook Dev"
      description="Owner-only setup surface for Facebook Login, SDK status checks, and the future review-gated Page publishing lane."
    >
      <FacebookDevPanel
        sdkConfigured={facebook.sdkConfigured}
        sdkEnabled={facebook.sdkEnabled}
        appIdConfigured={facebook.appIdConfigured}
        apiVersion={facebook.apiVersion}
        loginConfigId={facebook.loginConfigId}
        loginScope={facebook.loginScope}
      />
    </ContentPageShell>
  );
}
