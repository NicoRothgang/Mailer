"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Unlink, CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { disconnectProvider, triggerSync } from "@/lib/actions/connections";
import { formatRelativeTime, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ConnectionWithStats } from "@/types";
import type { EmailProvider } from "@prisma/client";

interface ProviderConfig {
  name: string;
  description: string;
  color: string;
  logo: React.ReactNode;
}

const GMAIL_LOGO = (
  <svg viewBox="0 0 24 24" className="h-6 w-6">
    <path fill="#4285F4" d="M6 6h12l-6 5z" />
    <path fill="#34A853" d="M18 6v12h-2V9.6L12 13 8 9.6V18H6V6z" />
    <path fill="#FBBC05" d="M6 6l6 5 6-5" />
    <path fill="#EA4335" d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5L12 11z" />
    <path fill="#fff" d="M3 5l9 7 9-7H3z" />
  </svg>
);

const OUTLOOK_LOGO = (
  <svg viewBox="0 0 24 24" className="h-6 w-6">
    <rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4" />
    <path fill="#fff" d="M12 6L4 10v10l8-3 8 3V10z" />
    <path fill="#fff" opacity=".5" d="M4 10l8 3 8-3" />
  </svg>
);

const PROVIDERS: Record<EmailProvider, ProviderConfig> = {
  GMAIL: {
    name: "Gmail",
    description: "Verbinde dein Google-Konto um Gmail zu analysieren.",
    color: "bg-red-50 border-red-200",
    logo: GMAIL_LOGO,
  },
  OUTLOOK: {
    name: "Outlook / Microsoft 365",
    description: "Verbinde dein Microsoft-Konto um Outlook zu analysieren.",
    color: "bg-blue-50 border-blue-200",
    logo: OUTLOOK_LOGO,
  },
};

interface ProviderCardProps {
  provider: EmailProvider;
  connection: ConnectionWithStats | null;
  connectUrl: string;
}

export function ProviderCard({ provider, connection, connectUrl }: ProviderCardProps) {
  const config = PROVIDERS[provider];
  const isConnected = !!connection;
  const [isPending, startTransition] = useTransition();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    if (!connection) return;
    setIsSyncing(true);
    startTransition(async () => {
      const result = await triggerSync(connection.id);
      if (result.success) {
        toast.success("Sync gestartet", { description: "Dein Postfach wird synchronisiert." });
      } else {
        toast.error("Sync fehlgeschlagen", { description: result.error });
      }
      setIsSyncing(false);
    });
  };

  const handleDisconnect = () => {
    if (!connection) return;
    startTransition(async () => {
      const result = await disconnectProvider(connection.id);
      if (result.success) {
        toast.success(`${config.name} getrennt`);
      } else {
        toast.error("Trennung fehlgeschlagen", { description: result.error });
      }
    });
  };

  const syncStatus = connection?.latestSync?.status;

  return (
    <Card className={cn("card-hover", isConnected && "border-emerald-200")}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border shrink-0", config.color)}>
            {config.logo}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{config.name}</h3>
              {isConnected ? (
                <Badge variant="success" className="text-[10px]">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verbunden
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px]">Nicht verbunden</Badge>
              )}
              {connection?.status === "EXPIRED" && (
                <Badge variant="warning" className="text-[10px]">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Token abgelaufen
                </Badge>
              )}
            </div>

            {isConnected && connection ? (
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-muted-foreground">{connection.email}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {connection.lastSyncAt
                      ? `Zuletzt: ${formatRelativeTime(connection.lastSyncAt)}`
                      : "Noch kein Sync"}
                  </span>
                  {connection.totalMessages > 0 && (
                    <span>{formatNumber(connection.totalMessages)} analysiert</span>
                  )}
                  {syncStatus === "RUNNING" && (
                    <span className="flex items-center gap-1 text-primary">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Läuft…
                    </span>
                  )}
                  {syncStatus === "FAILED" && (
                    <span className="text-red-500">Letzter Sync fehlgeschlagen</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{config.description}</p>
            )}

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {isConnected && connection ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSync}
                    disabled={isPending || isSyncing || syncStatus === "RUNNING"}
                    className="h-7 text-xs gap-1.5"
                  >
                    <RefreshCw className={cn("h-3 w-3", (isSyncing || syncStatus === "RUNNING") && "animate-spin")} />
                    Neu synchronisieren
                  </Button>

                  {connection.status === "EXPIRED" && (
                    <Button size="sm" variant="outline" asChild className="h-7 text-xs gap-1.5">
                      <a href={connectUrl}>
                        <ExternalLink className="h-3 w-3" />
                        Erneut verbinden
                      </a>
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
                        disabled={isPending}
                      >
                        <Unlink className="h-3 w-3" />
                        Trennen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{config.name} trennen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Die Verbindung zu <strong>{connection.email}</strong> wird getrennt.
                          Alle synchronisierten Analysedaten werden gelöscht.
                          Deine E-Mails bei {config.name} bleiben unberührt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDisconnect}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Verbindung trennen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <Button size="sm" asChild className="h-7 text-xs gap-1.5">
                  <a href={connectUrl}>
                    <ExternalLink className="h-3 w-3" />
                    {config.name} verbinden
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
