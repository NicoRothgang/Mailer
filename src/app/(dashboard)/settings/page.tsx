import type { Metadata } from "next";
import { User, Shield, Trash2, Download, Bell } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import Link from "next/link";

export const metadata: Metadata = { title: "Einstellungen" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Einstellungen" />

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Profil</CardTitle>
          </div>
          <CardDescription>Deine persönlichen Daten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={session.user.name ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input id="email" type="email" defaultValue={session.user.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">E-Mail-Änderungen werden in einer späteren Version unterstützt.</p>
          </div>
          <Button size="sm" disabled>Speichern</Button>
        </CardContent>
      </Card>

      {/* Notifications placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Benachrichtigungen</CardTitle>
          </div>
          <CardDescription>Wann möchtest du benachrichtigt werden?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Neue Spam-Risiken erkannt", desc: "Bei Mails mit hohem Risikoscore" },
            { label: "Sync abgeschlossen", desc: "Nach jeder erfolgreichen Synchronisation" },
            { label: "Token abgelaufen", desc: "Wenn eine Verbindung neu autorisiert werden muss" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch disabled />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Benachrichtigungen werden in einer späteren Version aktiviert.</p>
        </CardContent>
      </Card>

      {/* Provider connections */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Verbundene Konten</CardTitle>
          </div>
          <CardDescription>Verwalte deine E-Mail-Provider-Verbindungen</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" asChild>
            <Link href="/connections">Verbindungen verwalten</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">Datenschutz & Daten</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daten exportieren</p>
              <p className="text-xs text-muted-foreground">Exportiere alle gespeicherten Analysedaten als JSON</p>
            </div>
            <Button variant="outline" size="sm" disabled className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
          <Separator />
          <Alert variant="warning">
            <AlertDescription className="text-xs">
              <strong>Analysedaten löschen:</strong> Löscht alle synchronisierten Metadaten, Sender-Profile,
              Newsletter-Erkennungen und Risikoeinschätzungen. Deine E-Mails beim Provider bleiben unberührt.
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="sm" disabled>
            Alle Analysedaten löschen
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm text-destructive">Gefahrenzone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Account löschen</p>
              <p className="text-xs text-muted-foreground">
                Löscht deinen Account, alle Verbindungen und alle Analysedaten permanent.
              </p>
            </div>
            <Button variant="destructive" size="sm" disabled>
              Account löschen
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Diese Funktion wird nach finaler Implementierung der Datenlösch-Pipeline aktiviert.</p>
        </CardContent>
      </Card>
    </div>
  );
}
