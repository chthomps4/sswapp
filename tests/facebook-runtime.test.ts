import assert from "node:assert/strict";
import test from "node:test";
import { getFacebookRuntimeState } from "../src/lib/facebook-runtime";

function withEnv(next: () => void, values: Record<string, string | undefined>) {
  const originals: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(values)) {
    originals[key] = process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    next();
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("Facebook SDK stays disabled unless explicitly enabled", () => {
  withEnv(() => {
    const state = getFacebookRuntimeState();

    assert.equal(state.sdkEnabled, false);
    assert.equal(state.sdkConfigured, false);
  }, {
    NEXT_PUBLIC_FACEBOOK_SDK_ENABLED: undefined,
    NEXT_PUBLIC_FACEBOOK_APP_ID: "123",
    NEXT_PUBLIC_FACEBOOK_API_VERSION: "v25.0",
  });
});

test("Facebook SDK requires app id and api version", () => {
  withEnv(() => {
    const state = getFacebookRuntimeState();

    assert.equal(state.sdkEnabled, true);
    assert.equal(state.sdkConfigured, false);
    assert.equal(state.appIdConfigured, true);
    assert.equal(state.apiVersionConfigured, false);
  }, {
    NEXT_PUBLIC_FACEBOOK_SDK_ENABLED: "true",
    NEXT_PUBLIC_FACEBOOK_APP_ID: "123",
    NEXT_PUBLIC_FACEBOOK_API_VERSION: undefined,
  });
});

test("Facebook publishing requires explicit flag, page id, token, and auto publishing disabled", () => {
  withEnv(() => {
    const state = getFacebookRuntimeState();

    assert.equal(state.publishingEnabled, true);
    assert.equal(state.publishingConfigured, true);
    assert.equal(state.autoPublishingDisabled, true);
  }, {
    ENABLE_FACEBOOK_PUBLISHING: "true",
    FACEBOOK_PAGE_ID: "page-id",
    FACEBOOK_PAGE_ACCESS_TOKEN: "token",
    ENABLE_AUTO_PUBLISHING: "false",
  });
});

test("Facebook publishing refuses configured state when auto publishing is enabled", () => {
  withEnv(() => {
    const state = getFacebookRuntimeState();

    assert.equal(state.publishingEnabled, true);
    assert.equal(state.publishingConfigured, false);
    assert.equal(state.autoPublishingDisabled, false);
  }, {
    ENABLE_FACEBOOK_PUBLISHING: "true",
    FACEBOOK_PAGE_ID: "page-id",
    FACEBOOK_PAGE_ACCESS_TOKEN: "token",
    ENABLE_AUTO_PUBLISHING: "true",
  });
});
