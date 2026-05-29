import { SswDashboard } from "@/components/ssw-dashboard";
import { getOperationalDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dashboardData = await getOperationalDashboardData();
  return <SswDashboard brands={dashboardData.brands} posts={dashboardData.posts} dashboard={dashboardData.snapshot} />;
}
