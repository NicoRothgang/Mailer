import Link from "next/link";
import {
  Zap,
  Mail,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Mail,
    title: "Newsletter verwalten",
    description: "Erkenne alle Newsletter automatisch. Melde dich mit einem Klick von unerwünschten Absendern ab.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: CreditCard,
    title: "Abos erkennen",
    description: "Sieh alle aktiven Abonnements auf einen Blick. Erkenne ungenutztes Sparpotenzial sofort.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: ShieldCheck,
    title: "Spam & Risiken",
    description: "Heuristische Analyse verdächtiger Mails. Risikofaktoren transparent erklärt.",
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Users,
    title: "Sender organisieren",
    description: "Alle Absender übersichtlich gruppiert nach Marken und Kategorien.",
    color: "bg-amber-100 text-amber-600",
  },
  {
    icon: BarChart3,
    title: "Insights & Analytics",
    description: "Inbox Health Score, Volumentrends und Optimierungspotenziale auf einem Blick.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Bulk Cleanup",
    description: "Alte Werbemails und unnötige Massen-E-Mails sicher und schnell aufräumen.",
    color: "bg-indigo-100 text-indigo-600",
  },
];

const STATS = [
  { value: "∅ 120", label: "Newsletter pro Nutzer" },
  { value: "4.2h", label: "monatliche E-Mail-Zeit" },
  { value: "3–5", label: "aktive Abos unbemerkt" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-sm">Mail Control Center</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">
                Kostenlos starten
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          <Badge variant="info" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            Dein E-Mail-Postfach. Endlich unter Kontrolle.
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl text-balance">
            Übernimm die{" "}
            <span className="gradient-text">Kontrolle</span>
            {" "}über dein Postfach
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl text-balance">
            Analysiere Newsletter, erkenne Abos, identifiziere Spam-Risiken und räume dein E-Mail-Postfach
            dauerhaft auf — in Minuten statt Stunden.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Jetzt kostenlos starten
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Bereits registriert</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Keine Kreditkarte. Keine automatische Verlängerung. Datenschutz an erster Stelle.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App preview mockup */}
      <section className="px-4 sm:px-6 pb-20 max-w-5xl mx-auto">
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground border border-border">
                app.mailcontrolcenter.io/dashboard
              </div>
            </div>
          </div>
          {/* Dashboard preview */}
          <div className="flex h-72 bg-background">
            {/* Fake sidebar */}
            <div className="w-48 border-r border-border bg-muted/20 p-3 hidden sm:block">
              <div className="space-y-1">
                {["Dashboard", "Verbindungen", "Newsletter", "Abos", "Spam & Risiken", "Sender", "Insights"].map((item, i) => (
                  <div
                    key={item}
                    className={`rounded-md px-2 py-1.5 text-xs ${i === 0 ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Fake content */}
            <div className="flex-1 p-4 overflow-hidden">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Health Score", value: "78", color: "text-emerald-600" },
                  { label: "Newsletter", value: "42", color: "text-blue-600" },
                  { label: "Spam-Risiken", value: "3", color: "text-red-600" },
                  { label: "Abos", value: "12", color: "text-purple-600" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                    <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs font-medium mb-2">Top Sender</p>
                <div className="space-y-1.5">
                  {["Amazon", "Netflix", "Zalando", "LinkedIn"].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {s[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{s}</span>
                      <div className="flex-1 h-1 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Alles was du brauchst</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mail Control Center gibt dir vollständige Transparenz und Kontrolle über dein Postfach.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="card-hover">
                <CardContent className="p-6">
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trust section */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Deine Daten. Deine Kontrolle.</h2>
          <div className="grid sm:grid-cols-3 gap-6 mt-8">
            {[
              {
                icon: ShieldCheck,
                title: "Verschlüsselte Tokens",
                desc: "OAuth-Tokens werden AES-256-GCM verschlüsselt gespeichert. Niemals im Klartext.",
              },
              {
                icon: Zap,
                title: "Minimale Berechtigungen",
                desc: "Wir fordern nur die Berechtigungen an, die wirklich notwendig sind.",
              },
              {
                icon: CheckCircle,
                title: "Jederzeit löschbar",
                desc: "Trenne Provider-Verbindungen oder lösche deinen Account jederzeit vollständig.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col items-center text-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-3">Bereit, dein Postfach aufzuräumen?</h2>
        <p className="text-muted-foreground mb-8">
          Starte kostenlos, verbinde dein erstes Postfach und sieh sofort, was in deinem Posteingang passiert.
        </p>
        <Button size="lg" asChild>
          <Link href="/register">
            Jetzt kostenlos starten
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium">Mail Control Center</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-foreground transition-colors">Impressum</a>
            <a href="#" className="hover:text-foreground transition-colors">Kontakt</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Mail Control Center</p>
        </div>
      </footer>
    </div>
  );
}
