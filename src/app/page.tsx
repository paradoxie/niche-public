import { getProjects } from "@/lib/actions/projects";
import { getBacklinks, getMonthlyBacklinkCost } from "@/lib/actions/backlinks";
import { getExpenseStats, getUpcomingExpires, getMonthlyTrend } from "@/app/expenses/actions";
import { getResourceStats } from "@/app/resources/actions";
import { getToolStats } from "@/app/tools/actions";
import { HomePageClient } from "@/components/home/home-page-client";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projects, backlinks, monthlyBacklinkCost, expenseStats, upcomingExpires, resourceStats, toolStats, monthlyTrend] = await Promise.all([
    getProjects(),
    getBacklinks(),
    getMonthlyBacklinkCost(),
    getExpenseStats(),
    getUpcomingExpires(30),
    getResourceStats(),
    getToolStats(),
    getMonthlyTrend(),
  ]);

  const stats = {
    totalProjects: projects.length,
    activeAdsense: projects.filter((p) => p.adsenseStatus === "active").length,
    monthlyBacklinkCost,
  };

  return (
    <HomePageClient
      stats={stats}
      expenseStats={expenseStats}
      upcomingExpires={upcomingExpires}
      backlinks={backlinks}
      resourceStats={resourceStats}
      toolStats={toolStats}
      projects={projects}
      trend={monthlyTrend}
    />
  );
}
