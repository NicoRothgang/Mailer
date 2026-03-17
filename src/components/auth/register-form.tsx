"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { registerUser } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const PASSWORD_REQUIREMENTS = [
  { label: "Mindestens 8 Zeichen", test: (pw: string) => pw.length >= 8 },
  { label: "Ein Großbuchstabe", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Eine Zahl", test: (pw: string) => /[0-9]/.test(pw) },
];

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);

    // Step 1: Create account via server action
    const result = await registerUser(data);
    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setSuccess(true);

    // Step 2: Sign in client-side (avoids server redirect issues)
    const signInResult = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (signInResult?.error) {
      setServerError("Konto erstellt, aber Anmeldung fehlgeschlagen. Bitte manuell anmelden.");
      router.push("/login");
      return;
    }

    router.push("/onboarding");
    router.refresh();
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="rounded-full bg-emerald-100 p-3">
          <Check className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="font-medium text-foreground">Konto erstellt! Du wirst weitergeleitet…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="Max Mustermann"
            className="pl-9"
            autoComplete="name"
            {...register("name")}
          />
        </div>
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="deine@email.de"
            className="pl-9"
            autoComplete="email"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password">Passwort</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9 pr-10"
            autoComplete="new-password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password && (
          <ul className="space-y-1 mt-1.5">
            {PASSWORD_REQUIREMENTS.map((req) => (
              <li key={req.label} className={cn("flex items-center gap-1.5 text-xs", req.test(password) ? "text-emerald-600" : "text-muted-foreground")}>
                <Check className={cn("h-3 w-3", req.test(password) ? "opacity-100" : "opacity-30")} />
                {req.label}
              </li>
            ))}
          </ul>
        )}
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pl-9"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" loading={isSubmitting}>
        Konto erstellen
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Mit der Registrierung stimmst du unseren{" "}
        <a href="#" className="underline hover:text-foreground">Nutzungsbedingungen</a>
        {" "}und der{" "}
        <a href="#" className="underline hover:text-foreground">Datenschutzerklärung</a> zu.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Bereits ein Konto?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
