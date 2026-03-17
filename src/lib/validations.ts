import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name muss mindestens 2 Zeichen lang sein")
      .max(80, "Name darf maximal 80 Zeichen lang sein"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z
      .string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwörter stimmen nicht überein",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen lang sein")
    .max(80, "Name darf maximal 80 Zeichen lang sein")
    .optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Aktuelles Passwort ist erforderlich"),
    newPassword: z
      .string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .regex(/[A-Z]/, "Passwort muss mindestens einen Großbuchstaben enthalten")
      .regex(/[0-9]/, "Passwort muss mindestens eine Zahl enthalten"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwörter stimmen nicht überein",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
