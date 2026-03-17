import type { Metadata } from "next";
import { CreditCard, TrendingDown } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Abos" };

const CATEGORY_LABELS: Record<string, string> = {
  SOFTWARE_SAAS: "Software & SaaS",
  STREAMING_MEDIA: "Streaming",
  GAMING: "Gaming",
  CLOUD_STORAGE: "Cloud-Speicher",
  NEWS_MEDIA: "News & Medien",
  FITNESS: "Fitness",
  FOOD_DELIVERY: "Lieferdienst",
  ECOMMERCE_MEMBERSHIP: "E-Commerce",
  UTILITIES: "Dienste",
  FINANCE: "Finanzen",
  EDUCATION: "Bildung",
  PRODUCTIVITY: "Produktivität",
  OTHER: "Sonstiges",
};

const INTERVAL_LABELS: Record<string, string> = {
  MONTHLY: "/ Monat",
  QUARTERLY: "/ Quartal",
  YEARLY: "/ Jahr",
  WEEKLY: "/ Woche",
  ONE_TIME: "einmalig",
  UNKNOWN: "",
};

export default async function SubscriptionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const subscriptions = await db.subscriptionEntity.findMany({
    where: { userId: session.user.id },
    orderBy: [{ estimatedCost: "desc" }],
    include: { sender: true },
  });

  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE");
  const totalMonthly = activeSubscriptions
    .filter((s) => s.billingInterval === "MONTHLY" && s.estimatedCost)
    .reduce((sum, s) => sum + (s.estimatedCost ?? 0), 0);

  const totalYearly = activeSubscriptions
    .filter((s) => s.billingInterval === "YEARLY" && s.estimatedCost)
    .reduce((sum, s) => sum + (s.estimatedCost ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Erkannte Abos"
        description="Automatisch erkannte Abonnements basierend auf Rechnungs- und Verlängerungs-Mails"
      />

      {subscriptions.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-8 w-8" />}
          title="Noch keine Abos erkannt"
          description="Abonnements werden aus Rechnungen, Zahlungsbestätigungen und Verlängerungs-Mails erkannt."
          action={{ label: "Postfach synchronisieren", href: "/connections" }}
        />
      ) : (
        <>
          {/* Summary cards */}
          {(totalMonthly > 0 || totalYearly > 0) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {totalMonthly > 0 && (
                <Card>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Monatlich (geschätzt)</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(totalMonthly)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">aus {activeSubscriptions.length} aktiven Abos</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-muted-foreground" />
                  </CardContent>
                </Card>
              )}
              {totalYearly > 0 && (
                <Card>
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Jährlich (geschätzt)</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(totalYearly)}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <strong>Hinweis:</strong> Alle Kosten- und Intervallangaben basieren auf heuristischer Erkennung aus E-Mail-Metadaten
            und können unvollständig oder ungenau sein. Diese Ansicht ersetzt keine offizielle Kontoübersicht beim jeweiligen Anbieter.
          </p>

          {/* Subscription list */}
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-semibold text-sm uppercase">
                        {sub.serviceName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{sub.serviceName}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <Badge variant="secondary" className="text-[10px]">
                            {CATEGORY_LABELS[sub.serviceCategory] ?? sub.serviceCategory}
                          </Badge>
                          {sub.status === "ACTIVE" ? (
                            <Badge variant="success" className="text-[10px]">Aktiv</Badge>
                          ) : sub.status === "POSSIBLY_INACTIVE" ? (
                            <Badge variant="warning" className="text-[10px]">Evtl. inaktiv</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">{sub.status}</Badge>
                          )}
                          {sub.confidenceScore < 70 && (
                            <Badge variant="outline" className="text-[10px]">Unsicher</Badge>
                          )}
                        </div>
                        {sub.lastBillingDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Letzte Abrechnung: {formatRelativeTime(sub.lastBillingDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {sub.estimatedCost != null && (
                        <p className="text-sm font-semibold">
                          {formatCurrency(sub.estimatedCost, sub.currency)}
                          <span className="text-xs font-normal text-muted-foreground ml-1">
                            {sub.billingInterval ? INTERVAL_LABELS[sub.billingInterval] : ""}
                          </span>
                        </p>
                      )}
                      {sub.cancelUrl && (
                        <a
                          href={sub.cancelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Kündigen →
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
