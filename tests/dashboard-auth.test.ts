import assert from "node:assert/strict";
import test from "node:test";
import { requireOwnerResponse, isClerkConfigured, isDashboardAuthOpenForTesting } from "../src/lib/auth";
import { getDashboardAuthStatus } from "../src/lib/dashboard-auth";
import { getSetupStatus } from "../src/lib/setup-status";

test("dashboard auth is open for the temporary testing slice", () => {
  const status = getDashboardAuthStatus();

  assert.equal(status.mode, "open_testing");
  assert.equal(status.disabled, true);
  assert.equal(status.provider, "none");
  assert.equal(isClerkConfigured(), false);
  assert.equal(isDashboardAuthOpenForTesting(), true);
});

test("owner guard does not block routes while dashboard auth is removed", async () => {
  const denied = await requireOwnerResponse();

  assert.equal(denied, null);
});

test("setup status reports Clerk as removed without making owner emails a blocker", () => {
  const originalOwnerEmails = process.env.OWNER_EMAILS;
  delete process.env.OWNER_EMAILS;

  try {
    const setup = getSetupStatus();

    assert.equal(setup.dashboardAuthMode, "open_testing");
    assert.equal(setup.dashboardAuthDisabled, true);
    assert.equal(setup.clerkConfigured, false);
    assert.equal(setup.clerkAuthAvailable, false);
    assert.equal(setup.clerkAuthDisabled, true);
    assert.equal(setup.clerkAuthMode, "removed");
    assert.equal(setup.clerkKeyMode, "removed");
    assert.equal(setup.clerkProductionReady, false);
    assert.equal(setup.blockers.some((item) => item.key === "owner-emails"), false);
  } finally {
    if (originalOwnerEmails === undefined) {
      delete process.env.OWNER_EMAILS;
    } else {
      process.env.OWNER_EMAILS = originalOwnerEmails;
    }
  }
});
