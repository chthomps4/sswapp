import { SswDashboard } from "@/components/ssw-dashboard";
import { getOperationalDashboardData } from "@/lib/dashboard-data";
import { getLatestWorkflowGapAudit } from "@/lib/workflow-audit";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [dashboardData, latestAudit] = await Promise.all([getOperationalDashboardData(), getLatestWorkflowGapAudit()]);
  return (
    <SswDashboard
      brands={dashboardData.brands}
      posts={dashboardData.posts}
      dashboard={dashboardData.snapshot}
      latestAudit={
        latestAudit
          ? {
              id: latestAudit.id,
              auditDate: latestAudit.auditDate.toISOString().slice(0, 10),
              readinessLevel: latestAudit.readinessLevel.toLowerCase(),
              overallHealthScore: latestAudit.overallHealthScore,
              totalGaps: latestAudit.totalGaps,
              criticalCount: latestAudit.criticalCount,
              highCount: latestAudit.highCount,
              summary: latestAudit.summary || "",
            }
          : null
      }
    />
  );
}
