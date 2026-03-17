import type { Metadata } from "next";
import Link from "next/link";
import {
  Mail,
  ShieldAlert,
  CreditCard,
  TrendingUp,
  Plug,
  Users,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { HealthScore } from "@/components/dashboard/health-score";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import { auth } from "@/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [session, stats] = await Promise.all([auth(), getDashboardStats()]);

  if (!stats) {
    return (
      <EmptyState
        icon={<Mail className="h-8 w-8" />}
        title="Noch kein E-Mail-Konto verbunden"
        description="Verbinde dein erstes Postfach, um die Analyse zu starten."
        action={{ label: "Konto verbinden", href: "/connections" }}
      />
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] ?? "dort";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold">Hallo, {firstName} 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Hier ist deine aktuelle Postfach-Übersicht.
        </p>
      </div>

      {/* No connections banner */}
      {stats.connectedProviders === 0 && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-sm">Noch kein E-Mail-Konto verbunden</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verbinde Gmail oder Outlook, um dein Postfach zu analysieren.
            </p>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/connections">
              <Plug className="h-3.5 w-3.5" />
              Verbinden
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {/* Health Score */}
        <div className="md:col-span-2 lg:col-span-1 xl:col-span-1">
          <HealthScore score={stats.healthScore} className="h-full" />
        </div>

        {/* KPI Cards */}
        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Newsletter"
            value={stats.newsletterCount}
            description="aktive Abmeldungen möglich"
            icon={Mail}
            color="info"
          />
          <KpiCard
            title="Spam-Risiken"
            value={stats.spamRiskCount}
            description="zur Überprüfung"
            icon={ShieldAlert}
            color="danger"
          />
          <KpiCard
            title="Erkannte Abos"
            value={stats.subscriptionCount}
            description={`${stats.potentiallyUnusedCount} evtl. ungenutzt`}
            icon={CreditCard}
            color="purple"
          />
          <KpiCard
            title="Analysierte Mails"
            value={stats.totalMessages}
            description="gesamt"
            icon={TrendingUp}
            color="success"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Senders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm">Top Absender</CardTitle>
              <CardDescription>Meiste Mails in deinem Postfach</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/senders">
                Alle anzeigen
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pb-3">
            {stats.topSenders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Noch keine Daten — verbinde zuerst ein Postfach.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topSenders.map((sender, i) => {
                  const maxCount = stats.topSenders[0].totalMessages;
                  const percentage = (sender.totalMessages / maxCount) * 100;
                  return (
                    <div key={sender.domain} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground shrink-0 uppercase">
                        {(sender.brandName ?? sender.domain)[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate">
                            {sender.brandName ?? sender.domain}
                          </span>
                          <span className="text-xs text-muted-foreground shrink-0 ml-2">
                            {formatNumber(sender.totalMessages)}
                          </span>
                        </div>
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Schnellaktionen</CardTitle>
            <CardDescription>Das kannst du jetzt tun</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
              <Link href="/newsletters">
                <Mail className="h-4 w-4 text-blue-500" />
                Newsletter verwalten
                {stats.newsletterCount > 0 && (
                  <Badge variant="info" className="ml-auto">{stats.newsletterCount}</Badge>
                )}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
              <Link href="/spam">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                Risiken überprüfen
                {stats.spamRiskCount > 0 && (
                  <Badge variant="danger" className="ml-auto">{stats.spamRiskCount}</Badge>
                )}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
              <Link href="/subscriptions">
                <CreditCard className="h-4 w-4 text-purple-500" />
                Abos prüfen
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
              <Link href="/connections">
                <RefreshCw className="h-4 w-4 text-emerald-500" />
                Sync starten
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start text-sm h-9" asChild>
              <Link href="/senders">
                <Users className="h-4 w-4 text-amber-500" />
                Sender erkunden
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Letzte Aktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {stats.recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">{item.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
