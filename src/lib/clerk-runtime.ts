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
  domain: string;
  allowedRedirectOrigins: string[];
  canonicalHost: string;
  keyMode: ClerkKeyMode;
  hasClerkEnv: boolean;
  isConfigured: boolean;
  isProductionLike: boolean;
  canRenderClerkClient: boolean;
  canUseClerkServerAuth: boolean;
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

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function parseHost(rawOrigin: string) {
  try {
    return new URL(rawOrigin).hostname.toLowerCase();
  } catch {
    return rawOrigin
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .split(":")[0]
      .trim()
      .toLowerCase();
  }
}

function isLocalHost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function shouldIgnoreCanonicalHostInProduction(hostname: string, isProductionLike: boolean) {
  if (!isProductionLike) return false;
  return isLocalHost(hostname) || hostname.endsWith(".localhost");
}

function normalizeCanonicalAlias(hostname: string) {
  return hostname
    .toLowerCase()
    .replace(/^www\./i, "")
    .trim();
}

function normalizeHost(rawHost: string) {
  return rawHost
    .replace(/^https?:\/\//i, "")
    .replace(/\/.+$/, "")
    .split(":")[0]
    .trim()
    .toLowerCase();
}

export function getCanonicalHostFromEnv() {
  const configuredCanonicalHost = process.env.NEXT_PUBLIC_CANONICAL_HOST?.trim();
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
  const vercelProjectHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().toLowerCase();
  const vercelUrl = process.env.VERCEL_URL?.trim().toLowerCase();
  const isProductionLike = isProductionLikeContext();

  const candidates = [
    configuredCanonicalHost,
    configuredSiteUrl,
    appUrl,
    vercelProjectHost,
    vercelUrl,
  ];

  for (const candidate of candidates) {
    const host = normalizeHost(candidate || "");
    if (!host) continue;
    if (shouldIgnoreCanonicalHostInProduction(host, isProductionLike)) continue;
    return host;
  }

  return "";
}

function getAllowlistedRedirectOrigins(rawOrigins: string[], canonicalHost: string) {
  const keepNonCanonicalRedirectOrigins =
    process.env.SSW_KEEP_NONCANONICAL_REDIRECT_ORIGINS !== "false";
  const canonicalHostRoot = normalizeCanonicalAlias(canonicalHost);

  return uniqueValues(
    rawOrigins
      .map((origin) => normalizeOrigin(origin))
      .filter((origin) => {
        if (!origin) return false;
        const hostname = parseHost(origin);
        if (!hostname) return false;
        if (isLocalHost(hostname)) return true;
        if (!canonicalHost) return true;
        if (hostname === canonicalHost) return true;
        if (canonicalHostRoot && hostname === canonicalHostRoot) return true;
        if (canonicalHost && `www.${hostname}` === canonicalHost) return true;
        if (canonicalHostRoot && `www.${canonicalHostRoot}` === hostname) return true;
        if (keepNonCanonicalRedirectOrigins) return true;
        return false;
      }),
  );
}

function normalizeOrigin(rawOrigin: string) {
  const origin = rawOrigin.trim().replace(/\/+$/, "");
  if (!origin) return "";

  if (/^https?:\/\//i.test(origin)) {
    return origin;
  }

  if (origin.startsWith("localhost") || /^\d{1,3}(?:\.\d{1,3}){3}:\d+$/i.test(origin)) {
    return `http://${origin}`;
  }

  return `https://${origin}`;
}

function getAllowedRedirectOrigins() {
  const canonicalHost = getCanonicalHostFromEnv();
  const canonicalHostRoot = normalizeCanonicalAlias(canonicalHost);
  const canonicalHostWithWww = canonicalHostRoot ? `www.${canonicalHostRoot}` : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const resolvedAppUrl = appUrl ? normalizeOrigin(appUrl) : "";
  const canonicalHostOrigin = canonicalHost ? `https://${canonicalHost}` : "";
  const canonicalHostWwwOrigin = canonicalHostWithWww ? `https://${canonicalHostWithWww}` : "";

  const explicitOrigins = (
    process.env.CLERK_ALLOWED_REDIRECT_ORIGINS ||
    process.env.NEXT_PUBLIC_CLERK_ALLOWED_REDIRECT_ORIGINS ||
    ""
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
  const projectHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ? process.env.VERCEL_PROJECT_PRODUCTION_URL.trim() : "";
  const projectUrl = projectHost ? `https://${projectHost}` : "";
  const projectUrlWithWww = projectHost ? `https://www.${projectHost}` : "";

  const defaultOrigins = [
    canonicalHostOrigin,
    canonicalHostWwwOrigin,
    resolvedAppUrl,
    projectUrl,
    projectUrlWithWww,
    vercelUrl,
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  const filteredExplicitOrigins = getAllowlistedRedirectOrigins(explicitOrigins, canonicalHost);

  return uniqueValues([...defaultOrigins, ...filteredExplicitOrigins]).map((value) => normalizeOrigin(value));
}

export function getClerkRuntimeState(): ClerkRuntimeState {
  const publishableKey =
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || "").trim();
  const secretKey = (process.env.CLERK_SECRET_KEY || "").trim();
  const hasValidPublishableKey =
    publishableKey.startsWith(TEST_PREFIXES.publishable) || publishableKey.startsWith(LIVE_PREFIXES.publishable);
  const hasPublishableKey = Boolean(publishableKey && hasValidPublishableKey);
  const keyMode = inferKeyMode(publishableKey, secretKey);
  const isConfigured = keyMode === "development" || keyMode === "live";
  const isProductionLike = isProductionLikeContext();
  const customDomainEnabled =
    process.env.NEXT_PUBLIC_CLERK_CUSTOM_DOMAIN_ENABLED === "true" ||
    process.env.CLERK_CUSTOM_DOMAIN_ENABLED === "true";
  const domain = customDomainEnabled
    ? (process.env.NEXT_PUBLIC_CLERK_DOMAIN || process.env.CLERK_DOMAIN || "").trim().replace(/^https?:\/\//i, "")
    : "";

  const canUseClerkServerAuth = isConfigured && (!isProductionLike || keyMode === "live");
  const shouldUseClerkAuth = canUseClerkServerAuth;
  const shouldProtectPrivatelyInProduction = isProductionLike && keyMode !== "live";
  const canRenderClerkClient = hasPublishableKey;

  return {
    publishableKey,
    secretKey,
    domain,
    canonicalHost: getCanonicalHostFromEnv(),
    allowedRedirectOrigins: getAllowedRedirectOrigins(),
    keyMode,
    hasClerkEnv: Boolean(publishableKey || secretKey),
    isConfigured,
    isProductionLike,
    canRenderClerkClient,
    canUseClerkServerAuth,
    shouldUseClerkAuth,
    shouldProtectPrivatelyInProduction,
  };
}
