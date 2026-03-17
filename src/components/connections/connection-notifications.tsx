"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function ConnectionNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected === "gmail") {
      toast.success("Gmail verbunden", { description: "Dein Gmail-Konto wurde erfolgreich verbunden." });
    } else if (connected === "outlook") {
      toast.success("Outlook verbunden", { description: "Dein Outlook-Konto wurde erfolgreich verbunden." });
    }

    if (error) {
      const messages: Record<string, string> = {
        invalid_state: "Ungültiger OAuth-State. Bitte versuche es erneut.",
        state_mismatch: "Sicherheitsfehler. Bitte starte den Verbindungsprozess neu.",
        access_denied: "Du hast den Zugriff verweigert.",
      };
      toast.error("Verbindung fehlgeschlagen", {
        description: messages[error] ?? decodeURIComponent(error),
      });
    }

    if (connected || error) {
      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      url.searchParams.delete("error");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return null;
}
