import { SswDashboard } from "@/components/ssw-dashboard";
import { seedBrands, seedPosts } from "@/lib/seed-data";

export default function Home() {
  return <SswDashboard brands={seedBrands} posts={seedPosts} />;
}
