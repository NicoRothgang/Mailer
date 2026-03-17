import type { Metadata } from "next";
import { Shield, Info } from "lucide-react";
import { getUserConnections } from "@/lib/actions/connections";
import { ProviderCard } from "@/components/connections/provider-card";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Verbindungen" };

// Build OAuth initiation URLs
function getGmailConnectUrl() {
  return `/api/oauth/gmail/connect`;
}

function getOutlookConnectUrl() {
  return `/api/oauth/outlook/connect`;
}

export default async function ConnectionsPage() {
  const connections = await getUserConnections();

  const gmailConnection = connections.find((c) => c.provider === "GMAIL") ?? null;
  const outlookConnection = connections.find((c) => c.provider === "OUTLOOK") ?? null;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="E-Mail-Verbindungen"
        description="Verbinde deine Postfächer, um die Analyse zu starten."
      />

      {/* Privacy info */}
      <Alert variant="info">
        <Shield className="h-4 w-4" />
        <AlertTitle>Datenschutzhinweis</AlertTitle>
        <AlertDescription>
          Wir speichern ausschließlich Metadaten deiner E-Mails (Absender, Betreff, Datum).
          Vollständige E-Mail-Inhalte werden nicht dauerhaft gespeichert.
          OAuth-Tokens werden AES-256-GCM verschlüsselt und sind niemals im Frontend sichtbar.
        </AlertDescription>
      </Alert>

      {/* Provider cards */}
      <div className="space-y-4">
        <ProviderCard
          provider="GMAIL"
          connection={gmailConnection}
          connectUrl={getGmailConnectUrl()}
        />
        <ProviderCard
          provider="OUTLOOK"
          connection={outlookConnection}
          connectUrl={getOutlookConnectUrl()}
        />
      </div>

      {/* Coming soon */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In Planung</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {["Yahoo Mail", "Apple iCloud Mail"].map((name) => (
            <Card key={name} className="opacity-60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">Bald verfügbar</p>
                </div>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Permissions explanation */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-3">Angeforderte Berechtigungen</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium mb-1.5">Gmail</p>
              <ul className="space-y-1">
                {[
                  { scope: "gmail.readonly", desc: "Metadaten und Snippets lesen" },
                  { scope: "gmail.modify", desc: "Labels setzen, als gelesen markieren" },
                  { scope: "userinfo.email", desc: "E-Mail-Adresse für die Verbindungszuordnung" },
                ].map((s) => (
                  <li key={s.scope} className="flex items-start gap-2 text-xs">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] shrink-0">{s.scope}</code>
                    <span className="text-muted-foreground">{s.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium mb-1.5">Outlook / Microsoft Graph</p>
              <ul className="space-y-1">
                {[
                  { scope: "Mail.Read", desc: "E-Mail-Metadaten lesen" },
                  { scope: "Mail.ReadWrite", desc: "Labels und Kategorien setzen" },
                  { scope: "offline_access", desc: "Token automatisch aktualisieren" },
                ].map((s) => (
                  <li key={s.scope} className="flex items-start gap-2 text-xs">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] shrink-0">{s.scope}</code>
                    <span className="text-muted-foreground">{s.desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
