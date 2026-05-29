-- Extend automation enums for workflow gap audit runs.
ALTER TYPE "AutomationType" ADD VALUE 'weekly_workflow_gap_audit';
ALTER TYPE "AutomationStatus" ADD VALUE 'partial';

-- Workflow gap audit enums.
CREATE TYPE "WorkflowAuditStatus" AS ENUM ('running', 'completed', 'completed_with_warnings', 'failed', 'partial');
CREATE TYPE "WorkflowAuditTriggerType" AS ENUM ('manual', 'scheduled', 'cron', 'github_actions', 'post_deploy', 'test');
CREATE TYPE "WorkflowReadinessLevel" AS ENUM ('green', 'yellow', 'red');
CREATE TYPE "WorkflowGapSeverity" AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE "WorkflowGapStatus" AS ENUM ('new', 'reviewed', 'accepted', 'in_progress', 'resolved', 'ignored', 'converted_to_task');
CREATE TYPE "WorkflowGapActionStatus" AS ENUM ('open', 'in_progress', 'done', 'ignored');
CREATE TYPE "WorkflowAuditCheckpointStatus" AS ENUM ('passed', 'warning', 'failed', 'skipped');

-- Weekly workflow audit summary records.
CREATE TABLE "WorkflowGapAudit" (
    "id" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "status" "WorkflowAuditStatus" NOT NULL DEFAULT 'running',
    "triggerType" "WorkflowAuditTriggerType" NOT NULL DEFAULT 'manual',
    "summary" TEXT,
    "overallHealthScore" INTEGER NOT NULL DEFAULT 0,
    "readinessLevel" "WorkflowReadinessLevel" NOT NULL DEFAULT 'yellow',
    "totalGaps" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedCount" INTEGER NOT NULL DEFAULT 0,
    "ignoredCount" INTEGER NOT NULL DEFAULT 0,
    "automationRunId" TEXT,
    "inputJson" JSONB,
    "outputJson" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowGapAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowGap" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" "WorkflowGapSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "affectedEntityType" TEXT,
    "affectedEntityId" TEXT,
    "affectedBrandId" TEXT,
    "affectedPlatformId" TEXT,
    "recommendation" TEXT NOT NULL,
    "suggestedOwner" TEXT,
    "suggestedDueDate" TIMESTAMP(3),
    "status" "WorkflowGapStatus" NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowGap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowGapActionItem" (
    "id" TEXT NOT NULL,
    "gapId" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "WorkflowGapSeverity" NOT NULL,
    "status" "WorkflowGapActionStatus" NOT NULL DEFAULT 'open',
    "linkedEntityType" TEXT,
    "linkedEntityId" TEXT,
    "recommendedAction" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowGapActionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowAuditCheckpoint" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "checkpointKey" TEXT NOT NULL,
    "checkpointName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "WorkflowAuditCheckpointStatus" NOT NULL,
    "summary" TEXT NOT NULL,
    "recordsChecked" INTEGER NOT NULL DEFAULT 0,
    "gapsFound" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowAuditCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowGapAudit_auditDate_status_idx" ON "WorkflowGapAudit"("auditDate", "status");
CREATE INDEX "WorkflowGapAudit_readinessLevel_completedAt_idx" ON "WorkflowGapAudit"("readinessLevel", "completedAt");
CREATE INDEX "WorkflowGap_auditId_severity_status_idx" ON "WorkflowGap"("auditId", "severity", "status");
CREATE INDEX "WorkflowGap_category_status_idx" ON "WorkflowGap"("category", "status");
CREATE INDEX "WorkflowGap_affectedEntityType_affectedEntityId_idx" ON "WorkflowGap"("affectedEntityType", "affectedEntityId");
CREATE INDEX "WorkflowGapActionItem_auditId_status_priority_idx" ON "WorkflowGapActionItem"("auditId", "status", "priority");
CREATE INDEX "WorkflowGapActionItem_linkedEntityType_linkedEntityId_idx" ON "WorkflowGapActionItem"("linkedEntityType", "linkedEntityId");
CREATE INDEX "WorkflowAuditCheckpoint_auditId_checkpointKey_idx" ON "WorkflowAuditCheckpoint"("auditId", "checkpointKey");
CREATE INDEX "WorkflowAuditCheckpoint_status_category_idx" ON "WorkflowAuditCheckpoint"("status", "category");

ALTER TABLE "WorkflowGapAudit" ADD CONSTRAINT "WorkflowGapAudit_automationRunId_fkey" FOREIGN KEY ("automationRunId") REFERENCES "AutomationRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkflowGap" ADD CONSTRAINT "WorkflowGap_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "WorkflowGapAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowGap" ADD CONSTRAINT "WorkflowGap_affectedBrandId_fkey" FOREIGN KEY ("affectedBrandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkflowGap" ADD CONSTRAINT "WorkflowGap_affectedPlatformId_fkey" FOREIGN KEY ("affectedPlatformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WorkflowGapActionItem" ADD CONSTRAINT "WorkflowGapActionItem_gapId_fkey" FOREIGN KEY ("gapId") REFERENCES "WorkflowGap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowGapActionItem" ADD CONSTRAINT "WorkflowGapActionItem_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "WorkflowGapAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkflowAuditCheckpoint" ADD CONSTRAINT "WorkflowAuditCheckpoint_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "WorkflowGapAudit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
