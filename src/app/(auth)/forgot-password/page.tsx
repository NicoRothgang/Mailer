import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Zurück zur Anmeldung
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Passwort zurücksetzen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gib deine E-Mail-Adresse ein und wir senden dir einen Reset-Link.
        </p>
      </div>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Diese Funktion befindet sich noch in der Entwicklung. Bitte kontaktiere den Support für einen manuellen Reset.
        </AlertDescription>
      </Alert>

      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="deine@email.de"
              className="pl-9"
              disabled
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled>
          Reset-Link senden
        </Button>
      </form>
    </div>
  );
}
