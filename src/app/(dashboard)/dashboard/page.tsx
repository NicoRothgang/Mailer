import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { auth } from "@/auth";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, stats] = await Promise.all([auth(), getDashboardStats()]);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const kpiStats = {
    newsletters: stats?.newsletterCount ?? 0,
    spam: stats?.spamRiskCount ?? 0,
    subs: stats?.subscriptionCount ?? 0,
    total: stats?.totalMessages ?? 0,
  };

  if (!stats) {
    return (
      <>
        {/* Show the visual overview even without data */}
        <DashboardOverview firstName={firstName} stats={kpiStats} />
        <div className="mt-6">
          <EmptyState
            icon={<Mail className="h-8 w-8" />}
            title="Noch kein E-Mail-Konto verbunden"
            description="Verbinde dein erstes Postfach, um echte Daten zu analysieren."
            action={{ label: "Konto verbinden", href: "/connections" }}
          />
        </div>
      </>
    );
  }

  return <DashboardOverview firstName={firstName} stats={kpiStats} />;
}
