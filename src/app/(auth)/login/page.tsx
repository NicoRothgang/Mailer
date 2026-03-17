import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Anmelden",
};

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Willkommen zurück</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Melde dich mit deiner E-Mail-Adresse an
        </p>
      </div>

      {error === "OAuthAccountNotLinked" && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Diese E-Mail-Adresse ist bereits mit einem anderen Anmeldeweg verknüpft.
        </div>
      )}

      <LoginForm callbackUrl={callbackUrl} />
    </div>
  );
}
