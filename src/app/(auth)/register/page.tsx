import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registrieren",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kostenlos registrieren und Postfach analysieren
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
