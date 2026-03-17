"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, CheckCircle, Plug, RefreshCw, BarChart3, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { completeOnboarding } from "@/lib/actions/auth";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: 1,
    title: "Willkommen bei Mail Control Center",
    description: "Dein persönlicher Assistent für ein aufgeräumtes Postfach.",
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Mail Control Center hilft dir dabei:
        </p>
        <ul className="space-y-3">
          {[
            "Newsletter erkennen und mit einem Klick abmelden",
            "Aktive Abonnements und Kosten überblicken",
            "Spam- und Phishing-Risiken frühzeitig erkennen",
            "Dein Postfach nach Absendern organisieren",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
          <strong>Datenschutz:</strong> Wir speichern ausschließlich Metadaten deiner E-Mails.
          Vollständige Inhalte werden nie dauerhaft gespeichert.
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Erstes Postfach verbinden",
    description: "Verbinde Gmail oder Outlook, um die Analyse zu starten.",
    icon: Plug,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Du kannst jetzt dein erstes E-Mail-Konto verbinden oder diesen Schritt überspringen.
        </p>
        <div className="space-y-3">
          <a href="/api/oauth/gmail/connect?returnTo=/onboarding">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100">
                <span className="text-sm font-bold text-red-600">G</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Gmail verbinden</p>
                <p className="text-xs text-muted-foreground">Google / Workspace</p>
              </div>
            </Button>
          </a>
          <a href="/api/oauth/outlook/connect?returnTo=/onboarding">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-sm font-bold text-blue-600">O</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Outlook verbinden</p>
                <p className="text-xs text-muted-foreground">Microsoft / Office 365</p>
              </div>
            </Button>
          </a>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Erste Analyse starten",
    description: "Dein Postfach wird analysiert und kategorisiert.",
    icon: RefreshCw,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Nach dem Verbinden deines Postfachs wird der erste Sync automatisch gestartet.
          Das kann je nach Postfachgröße einige Minuten dauern.
        </p>
        <div className="space-y-2">
          {[
            "Metadaten der letzten Mails lesen",
            "Absender gruppieren und normalisieren",
            "Newsletter automatisch erkennen",
            "Spam-Risiken bewerten",
            "Inbox Health Score berechnen",
          ].map((step, i) => (
            <div key={step} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium shrink-0">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Alles bereit!",
    description: "Dein Dashboard wartet auf dich.",
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Du kannst jetzt dein Dashboard öffnen und mit der Analyse beginnen.
          Du kannst jederzeit weitere Postfächer in den Verbindungseinstellungen hinzufügen.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Dashboard", desc: "Übersicht & KPIs", href: "/dashboard" },
            { label: "Verbindungen", desc: "Konten verwalten", href: "/connections" },
            { label: "Newsletter", desc: "Abmelden", href: "/newsletters" },
            { label: "Insights", desc: "Analyse", href: "/insights" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    ),
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { data: session, update } = useSession();

  // If returning from Gmail/Outlook OAuth, jump to step 3 (index 2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      setCurrentStep(2);
    }
  }, []);

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleFinish = () => {
    startTransition(async () => {
      try {
        if (session?.user?.id) {
          await completeOnboarding(session.user.id);
          await update({ onboardingCompleted: true });
        }
      } catch (err) {
        console.error("completeOnboarding error:", err);
      }
      // Full page reload so middleware picks up the updated JWT cookie
      window.location.href = "/dashboard";
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-semibold">Mail Control Center</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                i <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Schritt {currentStep + 1} von {STEPS.length}</p>
                <h2 className="text-base font-semibold">{step.title}</h2>
              </div>
            </div>

            <div className="min-h-[200px]">{step.content}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep((s) => s - 1)}
                disabled={isFirst || isPending}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Zurück
              </Button>

              <div className="flex gap-2">
                {!isLast && currentStep === 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep((s) => s + 1)}
                  >
                    Überspringen
                  </Button>
                )}
                {isLast ? (
                  <Button size="sm" onClick={handleFinish} loading={isPending} className="gap-1.5">
                    Zum Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => setCurrentStep((s) => s + 1)}
                    className="gap-1.5"
                  >
                    Weiter
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
