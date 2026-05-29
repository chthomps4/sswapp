import assert from "node:assert/strict";
import test from "node:test";
import { getClerkRuntimeState } from "../src/lib/clerk-runtime";

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

test("Clerk runtime marks production test keys as invalid for auth", () => {
  withEnv(() => {
    const state = getClerkRuntimeState();

    assert.equal(state.keyMode, "development");
    assert.equal(state.shouldUseClerkAuth, false);
    assert.equal(state.shouldProtectPrivatelyInProduction, true);
    assert.equal(state.isConfigured, true);
  }, {
    VERCEL_ENV: "production",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
    CLERK_SECRET_KEY: "sk_test_123",
  });
});

test("Clerk runtime allows auth for production live keys", () => {
  withEnv(() => {
    const state = getClerkRuntimeState();

    assert.equal(state.keyMode, "live");
    assert.equal(state.shouldUseClerkAuth, true);
    assert.equal(state.shouldProtectPrivatelyInProduction, false);
    assert.equal(state.isConfigured, true);
  }, {
    VERCEL_ENV: "production",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_123",
    CLERK_SECRET_KEY: "sk_live_123",
  });
});

test("Clerk runtime rejects unknown key formats", () => {
  withEnv(() => {
    const state = getClerkRuntimeState();

    assert.equal(state.keyMode, "invalid");
    assert.equal(state.shouldUseClerkAuth, false);
    assert.equal(state.shouldProtectPrivatelyInProduction, true);
    assert.equal(state.isConfigured, false);
  }, {
    VERCEL_ENV: "production",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "bad-public-key",
    CLERK_SECRET_KEY: "bad-secret-key",
  });
});

test("Clerk runtime skips production guard in non-production contexts", () => {
  withEnv(() => {
    const state = getClerkRuntimeState();

    assert.equal(state.keyMode, "development");
    assert.equal(state.isProductionLike, false);
    assert.equal(state.shouldUseClerkAuth, true);
    assert.equal(state.shouldProtectPrivatelyInProduction, false);
  }, {
    VERCEL_ENV: undefined,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_123",
    CLERK_SECRET_KEY: "sk_test_123",
  });
});
