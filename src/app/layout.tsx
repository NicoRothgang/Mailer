import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mail Control Center",
    template: "%s | Mail Control Center",
  },
  description:
    "Analysiere, organisiere und bereinige dein E-Mail-Postfach. Newsletter abmelden, Spam erkennen, Abos verwalten – alles an einem Ort.",
  keywords: ["E-Mail", "Newsletter", "Postfach", "Spam", "Abmelden", "Inbox Management"],
  authors: [{ name: "Mail Control Center" }],
  openGraph: {
    type: "website",
    locale: "de_DE",
    title: "Mail Control Center",
    description: "Analysiere und kontrolliere dein E-Mail-Postfach.",
    siteName: "Mail Control Center",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider session={session}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "0.75rem",
              },
            }}
            richColors
            closeButton
          />
        </SessionProvider>
      </body>
    </html>
  );
}
