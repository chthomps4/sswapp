export type ClerkKeyMode = "missing" | "invalid" | "development" | "live";

const TEST_PREFIXES = {
  publishable: "pk_test_",
  secret: "sk_test_",
} as const;

const LIVE_PREFIXES = {
  publishable: "pk_live_",
  secret: "sk_live_",
} as const;

export type ClerkRuntimeState = {
  publishableKey: string;
  secretKey: string;
  keyMode: ClerkKeyMode;
  hasClerkEnv: boolean;
  isConfigured: boolean;
  isProductionLike: boolean;
  shouldUseClerkAuth: boolean;
  shouldProtectPrivatelyInProduction: boolean;
};

function isProductionLikeContext() {
  const vercelEnv = process.env.VERCEL_ENV || "";
  const publicVercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV || "";
  return vercelEnv === "production" || publicVercelEnv === "production";
}

function inferKeyMode(publishable: string, secret: string): ClerkKeyMode {
  const hasBothKeys = Boolean(publishable && secret);
  if (!hasBothKeys) return "missing";

  const isLivePair =
    publishable.startsWith(LIVE_PREFIXES.publishable) && secret.startsWith(LIVE_PREFIXES.secret);
  const isTestPair =
    publishable.startsWith(TEST_PREFIXES.publishable) && secret.startsWith(TEST_PREFIXES.secret);

  if (isLivePair) return "live";
  if (isTestPair) return "development";
  return "invalid";
}

export function getClerkRuntimeState(): ClerkRuntimeState {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const secretKey = process.env.CLERK_SECRET_KEY || "";
  const keyMode = inferKeyMode(publishableKey, secretKey);
  const isConfigured = keyMode === "development" || keyMode === "live";
  const isProductionLike = isProductionLikeContext();
  const shouldUseClerkAuth = isConfigured && (!isProductionLike || keyMode === "live");
  const shouldProtectPrivatelyInProduction = isProductionLike && keyMode !== "live";

  return {
    publishableKey,
    secretKey,
    keyMode,
    hasClerkEnv: Boolean(publishableKey || secretKey),
    isConfigured,
    isProductionLike,
    shouldUseClerkAuth,
    shouldProtectPrivatelyInProduction,
  };
}
