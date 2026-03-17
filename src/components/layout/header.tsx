"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Übersicht deines Postfachs" },
  "/connections": { title: "Verbindungen", description: "E-Mail-Konten verbinden und verwalten" },
  "/newsletters": { title: "Newsletter", description: "Erkannte Newsletter verwalten und abmelden" },
  "/subscriptions": { title: "Abos", description: "Erkannte Abonnements und Dienste" },
  "/spam": { title: "Spam & Risiken", description: "Verdächtige Mails und Risikobewertungen" },
  "/senders": { title: "Sender", description: "E-Mail-Absender organisiert nach Marken" },
  "/insights": { title: "Insights", description: "Analytics und Postfach-Gesundheit" },
  "/settings": { title: "Einstellungen", description: "Konto und App-Einstellungen" },
};

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();

  // Match exact or prefix
  const matchedKey = Object.keys(PAGE_TITLES).find(
    (key) => pathname === key || pathname.startsWith(key + "/")
  );
  const pageInfo = matchedKey ? PAGE_TITLES[matchedKey] : { title: "Mail Control Center", description: "" };

  return (
    <header
      className={cn(
        "h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10",
        className
      )}
    >
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-foreground leading-none">{pageInfo.title}</h1>
        {pageInfo.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{pageInfo.description}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search — visible on larger screens */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Suchen…"
            className="h-8 w-48 pl-8 text-xs bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Benachrichtigungen</span>
        </Button>
      </div>
    </header>
  );
}
