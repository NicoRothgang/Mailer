import type { Metadata } from "next";
import { Users } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime, formatNumber, domainToBrand } from "@/lib/utils";

export const metadata: Metadata = { title: "Sender" };

const CATEGORY_LABELS: Record<string, string> = {
  NEWSLETTER: "Newsletter",
  PROMOTION: "Werbung",
  SUBSCRIPTION_BILLING: "Rechnung",
  ORDER_CONFIRMATION: "Bestellung",
  SHIPPING: "Versand",
  SECURITY: "Sicherheit",
  SOCIAL: "Social",
  SPAM_SUSPECT: "Spam?",
  PHISHING_SUSPECT: "Phishing?",
  PERSONAL: "Persönlich",
  TRANSACTIONAL: "Transaktional",
  OTHER: "Sonstiges",
};

const CATEGORY_COLORS: Record<string, string> = {
  NEWSLETTER: "info",
  PROMOTION: "warning",
  SUBSCRIPTION_BILLING: "purple",
  ORDER_CONFIRMATION: "success",
  SHIPPING: "success",
  SECURITY: "danger",
  SPAM_SUSPECT: "danger",
  PHISHING_SUSPECT: "danger",
  OTHER: "secondary",
};

export default async function SendersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const senders = await db.sender.findMany({
    where: { userId: session.user.id },
    orderBy: { totalMessages: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sender"
        description={`${senders.length} Absender in deinem Postfach`}
      />

      {senders.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Noch keine Sender analysiert"
          description="Synchronisiere dein Postfach, um Absender automatisch zu gruppieren."
          action={{ label: "Postfach synchronisieren", href: "/connections" }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {senders.map((sender) => {
            const brandName = sender.brandName ?? domainToBrand(sender.domain);
            return (
              <Card key={sender.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold uppercase text-muted-foreground">
                      {brandName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{brandName}</p>
                      <p className="text-xs text-muted-foreground truncate">{sender.domain}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(sender.totalMessages)} Mails
                        </span>
                        {sender.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">
                            · {formatRelativeTime(sender.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {sender.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {sender.categories.slice(0, 3).map((cat) => (
                            <Badge
                              key={cat}
                              variant={(CATEGORY_COLORS[cat] ?? "secondary") as Parameters<typeof Badge>[0]["variant"]}
                              className="text-[10px]"
                            >
                              {CATEGORY_LABELS[cat] ?? cat}
                            </Badge>
                          ))}
                        </div>
                      )}
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
