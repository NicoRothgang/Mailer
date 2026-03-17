import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Auth form */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-900/40">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm group-hover:text-primary transition-colors">
              Mail Control Center
            </span>
          </Link>
          {children}
        </div>
      </div>

      {/* Right: Visual panel */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-violet-950/60 to-background border-l border-border p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="max-w-md space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Dein Postfach. Wieder unter Kontrolle.</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Analysiere Newsletter, erkenne Abonnements und identifiziere Spam-Risiken
              — alles an einem Ort, sicher und transparent.
            </p>
          </div>

          {/* Feature bullets */}
          <ul className="space-y-3">
            {[
              "Ein-Klick Newsletter-Abmeldung",
              "Erkannte Abos mit Kosten-Überblick",
              "Heuristische Spam- & Phishing-Warnung",
              "Keine E-Mail-Inhalte gespeichert",
              "OAuth-Tokens AES-256 verschlüsselt",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <div className="h-5 w-5 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                  <Zap className="h-3 w-3 text-violet-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          {/* Trust badge */}
          <div className="rounded-xl border border-border bg-background/60 p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Datenschutz zuerst.</span>{" "}
              Wir speichern nur Metadaten — keine vollständigen E-Mail-Inhalte.
              OAuth-Tokens werden serverseitig verschlüsselt und sind niemals im Frontend sichtbar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
