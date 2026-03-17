import type { Metadata } from "next";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatRelativeTime, getRiskLabel, getRiskColor, cn } from "@/lib/utils";
import type { RiskFactor } from "@/types";

export const metadata: Metadata = { title: "Spam & Risiken" };

function RiskScoreBadge({ score }: { score: number }) {
  if (score >= 75) return <Badge variant="danger">{getRiskLabel(score)}</Badge>;
  if (score >= 50) return <Badge variant="warning">{getRiskLabel(score)}</Badge>;
  return <Badge variant="secondary">{getRiskLabel(score)}</Badge>;
}

export default async function SpamPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const riskEntities = await db.riskEntity.findMany({
    where: { userId: session.user.id, status: "PENDING_REVIEW" },
    orderBy: { riskScore: "desc" },
    include: {
      message: {
        select: {
          subject: true,
          fromEmail: true,
          fromName: true,
          fromDomain: true,
          sentAt: true,
          snippet: true,
        },
      },
    },
    take: 100,
  });

  const highRisk = riskEntities.filter((r) => r.riskScore >= 75).length;
  const mediumRisk = riskEntities.filter((r) => r.riskScore >= 50 && r.riskScore < 75).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spam & Risiken"
        description="Heuristische Risikoanalyse verdächtiger Mails"
        actions={
          <div className="flex items-center gap-2">
            {highRisk > 0 && <Badge variant="danger">{highRisk} hohes Risiko</Badge>}
            {mediumRisk > 0 && <Badge variant="warning">{mediumRisk} mittleres Risiko</Badge>}
          </div>
        }
      />

      {/* Disclaimer */}
      <Alert variant="warning">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Heuristik-Hinweis:</strong> Diese Bewertungen basieren auf automatischer Mustererkennung aus
          Metadaten (Absender, Betreff, Header). Sie sind keine Garantie für echten Spam oder Phishing.
          Entscheide eigenverantwortlich und kontaktiere deinen E-Mail-Anbieter für offizielle Spam-Meldungen.
        </AlertDescription>
      </Alert>

      {riskEntities.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-8 w-8" />}
          title="Keine Risiken erkannt"
          description="Aktuell wurden keine verdächtigen Mails gefunden. Das bedeutet nicht, dass dein Postfach vollständig sicher ist."
        />
      ) : (
        <div className="space-y-3">
          {riskEntities.map((risk) => {
            const factors = risk.riskFactors as unknown as RiskFactor[];
            return (
              <Card key={risk.id} className={cn(
                "border-l-4",
                risk.riskScore >= 75 ? "border-l-red-500" : risk.riskScore >= 50 ? "border-l-amber-500" : "border-l-yellow-400"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2 flex-wrap mb-1">
                        <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", getRiskColor(risk.riskScore))} />
                        <p className="text-sm font-medium truncate">
                          {risk.message.subject ?? "(kein Betreff)"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Von: {risk.message.fromName ? `${risk.message.fromName} <${risk.message.fromEmail}>` : risk.message.fromEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Domain: <code className="bg-muted px-1 rounded">{risk.message.fromDomain}</code>
                        {" · "}{formatRelativeTime(risk.message.sentAt)}
                      </p>

                      {/* Risk factors */}
                      {factors.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {factors.map((f: RiskFactor) => (
                            <span
                              key={f.type}
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground border border-border"
                              title={f.description}
                            >
                              {f.label}
                            </span>
                          ))}
                        </div>
                      )}

                      {risk.message.snippet && (
                        <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2 bg-muted/50 rounded p-2">
                          {risk.message.snippet}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <RiskScoreBadge score={risk.riskScore} />
                      <span className={cn("text-lg font-bold", getRiskColor(risk.riskScore))}>
                        {risk.riskScore}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
