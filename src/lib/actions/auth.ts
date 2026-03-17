"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

export async function registerUser(input: RegisterInput) {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false as const, error: "Diese E-Mail-Adresse ist bereits registriert." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true as const };
  } catch (err) {
    console.error("registerUser error:", err);
    return { success: false as const, error: "Registrierung fehlgeschlagen. Bitte versuche es erneut." };
  }
}

export async function loginUser(email: string, password: string, callbackUrl?: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl ?? "/onboarding",
    });
    return { success: true as const };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false as const, error: "Ungültige E-Mail oder Passwort." };
        default:
          return { success: false as const, error: "Anmeldefehler. Bitte versuche es erneut." };
      }
    }
    throw error; // Re-throw redirect errors
  }
}

export async function logoutUser() {
  await signOut({ redirectTo: "/login" });
}

export async function completeOnboarding(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { onboardingCompleted: true },
  });
}
