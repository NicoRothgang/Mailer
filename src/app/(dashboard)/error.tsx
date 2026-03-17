"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Seite konnte nicht geladen werden</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message ?? "Ein unerwarteter Fehler ist aufgetreten."}
        </p>
      </div>
      <Button size="sm" variant="outline" onClick={reset} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Erneut versuchen
      </Button>
    </div>
  );
}
