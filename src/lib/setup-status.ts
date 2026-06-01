import { getDashboardAuthStatus } from "./dashboard-auth";
import { isDatabaseConfigured } from "./db-operational";
import { getFacebookRuntimeState } from "./facebook-runtime";

export type SetupStatusItem = {
  key: string;
  label: string;
  ok: boolean;
  value: string;
  action: string;
};

export function getSetupStatus() {
  const dashboardAuth = getDashboardAuthStatus();
  const clerkKeyMode = "removed";
  const clerkAuthDisabled = true;
  const clerkAuthMode = "removed";
  const clerkAuthAvailable = false;
  const clerkConfigured = false;
  const clerkProductionReady = false;
  const ownerEmailsConfigured = Boolean(process.env.OWNER_EMAILS);
  const databaseConfigured = isDatabaseConfigured();
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const autoApprovalDisabled = process.env.ENABLE_AUTO_APPROVAL !== "true";
  const autoPublishingDisabled = process.env.ENABLE_AUTO_PUBLISHING !== "true";
  const facebook = getFacebookRuntimeState();

  const items: SetupStatusItem[] = [
    {
      key: "database",
      label: "Database",
      ok: databaseConfigured,
      value: databaseConfigured ? "configured" : "missing",
      action: "Set DATABASE_URL and DIRECT_URL in Vercel.",
    },
    {
      key: "dashboard-auth",
      label: "Dashboard auth",
      ok: dashboardAuth.disabled,
      value: dashboardAuth.mode,
      action: dashboardAuth.message,
    },
    {
      key: "owner-emails",
      label: "Owner emails",
      ok: ownerEmailsConfigured,
      value: ownerEmailsConfigured ? "configured" : "missing",
      action: "Set OWNER_EMAILS to the owner login email addresses.",
    },
    {
      key: "openai",
      label: "OpenAI",
      ok: openaiConfigured,
      value: openaiConfigured ? "configured" : "fallback mode",
      action: "Optional. Set OPENAI_API_KEY for live AI generation; deterministic fallback still works.",
    },
    {
      key: "auto-approval",
      label: "Auto approval",
      ok: autoApprovalDisabled,
      value: autoApprovalDisabled ? "disabled" : "enabled",
      action: "Keep ENABLE_AUTO_APPROVAL false or unset.",
    },
    {
      key: "auto-publishing",
      label: "Auto publishing",
      ok: autoPublishingDisabled,
      value: autoPublishingDisabled ? "disabled" : "enabled",
      action: "Keep ENABLE_AUTO_PUBLISHING false or unset.",
    },
    {
      key: "facebook-sdk",
      label: "Facebook SDK",
      ok: !facebook.sdkEnabled || facebook.sdkConfigured,
      value: facebook.sdkConfigured ? "configured" : facebook.sdkEnabled ? "missing config" : "disabled",
      action:
        "Optional. Set NEXT_PUBLIC_FACEBOOK_SDK_ENABLED, NEXT_PUBLIC_FACEBOOK_APP_ID, and NEXT_PUBLIC_FACEBOOK_API_VERSION for Facebook Login checks.",
    },
    {
      key: "facebook-publishing",
      label: "Facebook publishing",
      ok: !facebook.publishingEnabled || facebook.publishingConfigured,
      value: facebook.publishingConfigured
        ? "configured"
        : facebook.publishingEnabled
          ? "missing server config"
          : "disabled",
      action:
        "Optional. Keep disabled until Page permissions are approved; use server-only FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN when ready.",
    },
  ];

  const blockers = items.filter(
    (item) => !item.ok && !["owner-emails", "openai", "facebook-sdk", "facebook-publishing"].includes(item.key),
  );
  return {
    ready: blockers.length === 0,
    dashboardAuthMode: dashboardAuth.mode,
    dashboardAuthDisabled: dashboardAuth.disabled,
    clerkAuthDisabled,
    clerkAuthAvailable,
    clerkAuthMode,
    clerkConfigured,
    clerkKeyMode,
    clerkProductionReady,
    items,
    blockers,
  };
}
