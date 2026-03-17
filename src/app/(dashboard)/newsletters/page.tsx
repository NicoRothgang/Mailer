import type { Metadata } from "next";
import { Mail, Filter, Search } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatRelativeTime, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter" };

export default async function NewslettersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const newsletters = await db.newsletterEntity.findMany({
    where: { userId: session.user.id },
    orderBy: { messageCount: "desc" },
    include: { sender: true },
  });

  const activeCount = newsletters.filter((n) => n.status === "ACTIVE").length;
  const unsubscribedCount = newsletters.filter((n) => n.status === "UNSUBSCRIBED").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        description={`${activeCount} aktive Newsletter erkannt`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">{activeCount} aktiv</Badge>
            {unsubscribedCount > 0 && (
              <Badge variant="secondary">{unsubscribedCount} abgemeldet</Badge>
            )}
          </div>
        }
      />

      {newsletters.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title="Noch keine Newsletter erkannt"
          description="Synchronisiere zuerst dein Postfach. Newsletter werden automatisch anhand von Metadaten erkannt."
          action={{ label: "Verbindungen verwalten", href: "/connections" }}
        />
      ) : (
        <>
          {/* Search & Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Newsletter suchen…" className="pl-8 h-8 text-xs" />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>

          {/* Newsletter list */}
          <div className="space-y-2">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id} className="hover:border-border/80 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm uppercase">
                        {(newsletter.senderName ?? newsletter.senderEmail)[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {newsletter.senderName ?? newsletter.senderEmail}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{newsletter.senderEmail}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {formatNumber(newsletter.messageCount)} Mails
                          </span>
                          {newsletter.lastMessageAt && (
                            <span className="text-xs text-muted-foreground">
                              Letzte: {formatRelativeTime(newsletter.lastMessageAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {newsletter.status === "ACTIVE" ? (
                        <Badge variant="info" className="text-[10px]">Aktiv</Badge>
                      ) : newsletter.status === "UNSUBSCRIBED" ? (
                        <Badge variant="success" className="text-[10px]">Abgemeldet</Badge>
                      ) : newsletter.status === "PENDING_UNSUBSCRIBE" ? (
                        <Badge variant="warning" className="text-[10px]">Ausstehend</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">{newsletter.status}</Badge>
                      )}

                      {newsletter.status === "ACTIVE" && newsletter.unsubscribeUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a href={newsletter.unsubscribeUrl} target="_blank" rel="noopener noreferrer">
                            Abmelden
                          </a>
                        </Button>
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
