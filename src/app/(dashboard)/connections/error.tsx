"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ConnectionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Connections page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        Die Verbindungsseite konnte nicht geladen werden. Bitte versuche es erneut.
      </p>
      <Button size="sm" onClick={reset}>
        Erneut versuchen
      </Button>
    </div>
  );
}
