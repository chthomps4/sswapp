import assert from "node:assert/strict";
import test from "node:test";
import { GET as cronGet } from "../src/app/api/cron/workflow-gap-audit/route";
import { POST as manualRunPost } from "../src/app/api/workflow-audits/run/route";

function restoreEnv(snapshot: NodeJS.ProcessEnv) {
  process.env = { ...snapshot };
}

test("cron workflow audit rejects requests without secret", async () => {
  const env = { ...process.env };
  process.env.CRON_SECRET = "test-secret";
  const response = await cronGet(new Request("http://localhost/api/cron/workflow-gap-audit"));
  restoreEnv(env);
  assert.equal(response.status, 401);
});

test("cron workflow audit requires explicit enable flags", async () => {
  const env = { ...process.env };
  process.env.CRON_SECRET = "test-secret";
  delete process.env.ENABLE_WEEKLY_WORKFLOW_GAP_AUDIT;
  delete process.env.WEEKLY_WORKFLOW_AUDIT_CRON_ENABLED;
  const response = await cronGet(new Request("http://localhost/api/cron/workflow-gap-audit", { headers: { authorization: "Bearer test-secret" } }));
  restoreEnv(env);
  assert.equal(response.status, 409);
});

test("manual workflow audit fails clearly without database", async () => {
  const env = { ...process.env };
  delete process.env.DATABASE_URL;
  delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  delete process.env.CLERK_SECRET_KEY;
  const response = await manualRunPost(new Request("http://localhost/api/workflow-audits/run", { method: "POST", body: JSON.stringify({ dryRun: true }) }));
  restoreEnv(env);
  assert.equal(response.status, 503);
});
