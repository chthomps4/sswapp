import { getClerkRuntimeState } from "./clerk-runtime";
import { isDatabaseConfigured } from "./db-operational";

export type SetupStatusItem = {
  key: string;
  label: string;
  ok: boolean;
  value: string;
  action: string;
};

export function getSetupStatus() {
  const clerk = getClerkRuntimeState();
  const clerkKeyMode = clerk.keyMode;
  const clerkAuthAvailable = clerk.shouldUseClerkAuth;
  const clerkConfigured = clerk.isConfigured;
  const clerkProductionReady = clerkKeyMode === "live";
  const ownerEmailsConfigured = Boolean(process.env.OWNER_EMAILS);
  const databaseConfigured = isDatabaseConfigured();
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const autoApprovalDisabled = process.env.ENABLE_AUTO_APPROVAL !== "true";
  const autoPublishingDisabled = process.env.ENABLE_AUTO_PUBLISHING !== "true";

  const items: SetupStatusItem[] = [
    {
      key: "database",
      label: "Database",
      ok: databaseConfigured,
      value: databaseConfigured ? "configured" : "missing",
      action: "Set DATABASE_URL and DIRECT_URL in Vercel.",
    },
    {
      key: "clerk",
      label: "Clerk production keys",
      ok: clerkProductionReady,
      value: clerkKeyMode,
      action: "Replace Vercel Clerk env vars with pk_live... and sk_live..., then redeploy.",
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
  ];

  const blockers = items.filter((item) => !item.ok && item.key !== "openai");
  return {
    ready: blockers.length === 0,
    clerkAuthAvailable,
    clerkConfigured,
    clerkKeyMode,
    clerkProductionReady,
    items,
    blockers,
  };
}
