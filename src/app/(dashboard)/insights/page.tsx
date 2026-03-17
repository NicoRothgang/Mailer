import type { Metadata } from "next";
import { BarChart3, TrendingUp, Mail, CreditCard, ShieldAlert } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { HealthScore } from "@/components/dashboard/health-score";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Insights" };

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [
    latestScore,
    totalMessages,
    newsletterCount,
    spamRiskCount,
    subscriptionCount,
    topNewsletter,
  ] = await Promise.all([
    db.inboxScoreSnapshot.findFirst({ where: { userId }, orderBy: { calculatedAt: "desc" } }),
    db.emailMessage.count({ where: { userId } }),
    db.newsletterEntity.count({ where: { userId, status: "ACTIVE" } }),
    db.riskEntity.count({ where: { userId, riskScore: { gte: 50 } } }),
    db.subscriptionEntity.count({ where: { userId } }),
    db.newsletterEntity.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { messageCount: "desc" },
      take: 5,
    }),
  ]);

  if (totalMessages === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-8 w-8" />}
        title="Noch keine Insights verfügbar"
        description="Synchronisiere dein Postfach, um detaillierte Analysen zu sehen."
        action={{ label: "Postfach verbinden", href: "/connections" }}
      />
    );
  }

  const score = latestScore?.score ?? 75;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="Deine Postfach-Gesundheit auf einen Blick"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <HealthScore score={score} className="h-full" />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Mails gesamt" value={totalMessages} icon={Mail} color="default" />
          <KpiCard title="Newsletter" value={newsletterCount} icon={Mail} color="info" />
          <KpiCard title="Spam-Risiken" value={spamRiskCount} icon={ShieldAlert} color="danger" />
          <KpiCard title="Abos" value={subscriptionCount} icon={CreditCard} color="purple" />
        </div>
      </div>

      {topNewsletter.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Aktivste Newsletter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topNewsletter.map((nl, i) => {
                const max = topNewsletter[0].messageCount;
                const pct = (nl.messageCount / max) * 100;
                return (
                  <div key={nl.id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate">
                          {nl.senderName ?? nl.senderEmail}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">{nl.messageCount}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score history placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Health Score Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Verlaufsdaten werden nach mehreren Syncs verfügbar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
