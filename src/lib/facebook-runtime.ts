function readEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function isEnabled(name: string) {
  return readEnv(name) === "true";
}

export function getFacebookRuntimeState() {
  const appId = readEnv("NEXT_PUBLIC_FACEBOOK_APP_ID");
  const apiVersion = readEnv("NEXT_PUBLIC_FACEBOOK_API_VERSION");
  const loginConfigId = readEnv("NEXT_PUBLIC_FACEBOOK_LOGIN_CONFIG_ID");
  const loginScope = readEnv("NEXT_PUBLIC_FACEBOOK_LOGIN_SCOPE") || "public_profile,email";
  const sdkEnabled = isEnabled("NEXT_PUBLIC_FACEBOOK_SDK_ENABLED");
  const pageIdConfigured = Boolean(readEnv("FACEBOOK_PAGE_ID"));
  const pageAccessTokenConfigured = Boolean(readEnv("FACEBOOK_PAGE_ACCESS_TOKEN"));
  const publishingEnabled = isEnabled("ENABLE_FACEBOOK_PUBLISHING");
  const autoPublishingDisabled = !isEnabled("ENABLE_AUTO_PUBLISHING");

  return {
    appId,
    apiVersion,
    loginConfigId,
    loginScope,
    sdkEnabled,
    appIdConfigured: Boolean(appId),
    apiVersionConfigured: Boolean(apiVersion),
    sdkConfigured: sdkEnabled && Boolean(appId) && Boolean(apiVersion),
    loginButtonConfigured: Boolean(loginConfigId),
    pageIdConfigured,
    pageAccessTokenConfigured,
    publishingEnabled,
    publishingConfigured:
      publishingEnabled && pageIdConfigured && pageAccessTokenConfigured && autoPublishingDisabled,
    autoPublishingDisabled,
  };
}
