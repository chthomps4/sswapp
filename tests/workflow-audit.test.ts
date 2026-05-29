import assert from "node:assert/strict";
import test from "node:test";
import { WorkflowAuditCheckpointStatus, WorkflowGapSeverity } from "@prisma/client";
import { generateWorkflowAuditSummary, redactSensitive, scoreWorkflowHealth } from "../src/lib/workflow-audit";

test("workflow audit health score follows severity weights", () => {
  const score = scoreWorkflowHealth([
    { severity: WorkflowGapSeverity.CRITICAL },
    { severity: WorkflowGapSeverity.HIGH },
    { severity: WorkflowGapSeverity.MEDIUM },
    { severity: WorkflowGapSeverity.LOW },
  ]);
  assert.equal(score.overallHealthScore, 60);
  assert.equal(score.readinessLevel, "YELLOW");
  assert.equal(score.totalGaps, 4);
});

test("workflow audit deterministic summary highlights critical and high gaps", () => {
  const gaps = [
    {
      category: "security_privacy_risk" as const,
      severity: WorkflowGapSeverity.CRITICAL,
      title: "Auto publishing is enabled",
      description: "Publishing must stay manual.",
      recommendation: "Set ENABLE_AUTO_PUBLISHING=false.",
    },
    {
      category: "automation_failure" as const,
      severity: WorkflowGapSeverity.HIGH,
      title: "Run Today failed",
      description: "The daily workflow failed.",
      recommendation: "Fix Run Today and rerun it.",
    },
  ];
  const score = scoreWorkflowHealth(gaps);
  const summary = generateWorkflowAuditSummary(gaps, [
    {
      checkpointKey: "config",
      checkpointName: "Config",
      category: "security",
      status: WorkflowAuditCheckpointStatus.FAILED,
      summary: "Failed",
      recordsChecked: 1,
      gaps,
      durationMs: 1,
    },
  ], score);
  assert.equal(summary.manualReviewNeeded, true);
  assert.ok(summary.criticalFindings.includes("Auto publishing is enabled"));
  assert.ok(summary.highPriorityFindings.includes("Run Today failed"));
});

test("workflow audit redacts secrets from reports and errors", () => {
  const redacted = redactSensitive("DATABASE_URL=postgresql://user:pass@example/db OPENAI_API_KEY=sk-testsecretvalue123456789");
  assert.doesNotMatch(redacted, /postgresql:\/\/user/);
  assert.doesNotMatch(redacted, /sk-testsecret/);
  assert.match(redacted, /\[REDACTED/);
});
