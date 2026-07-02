import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [{ title: "Mon profil — ConseilSV" }],
  }),
  component: ProfilePage,
});

type Profession =
  | "assistant_technique_pharmacie"
  | "etudiant_medecine"
  | "etudiant_pharmacie"
  | "etudiant_soins_infirmiers"
  | "infirmiere"
  | "infirmiere_auxiliaire"
  | "inhalotherapeute"
  | "medecin"
  | "pharmacien"
  | "sage_femme"
  | "technicien_pharmacie";

const PROFESSIONS: { value: Profession; label: string }[] = [
  { value: "assistant_technique_pharmacie", label: "Assistant(e) technique en pharmacie" },
  { value: "etudiant_medecine", label: "Étudiant(e) en médecine" },
  { value: "etudiant_pharmacie", label: "Étudiant(e) en pharmacie" },
  { value: "etudiant_soins_infirmiers", label: "Étudiant(e) en soins infirmiers" },
  { value: "infirmiere", label: "Infirmier(ère)" },
  { value: "infirmiere_auxiliaire", label: "Infirmier(ère) auxiliaire" },
  { value: "inhalotherapeute", label: "Inhalothérapeute" },
  { value: "medecin", label: "Médecin" },
  { value: "pharmacien", label: "Pharmacien(ne)" },
  { value: "sage_femme", label: "Sage-femme" },
  { value: "technicien_pharmacie", label: "Technicien(ne) en pharmacie" },
];


function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState<Profession | "">("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("email,full_name,profession,license_number")
        .eq("id", userData.user.id)
        .maybeSingle();
      if (data) {
        setEmail(data.email ?? userData.user.email ?? "");
        setFullName(data.full_name ?? "");
        setProfession((data.profession as Profession | null) ?? "");
        setLicenseNumber(data.license_number ?? "");
      }
      setLoading(false);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        profession: (profession || null) as Profession | null,
        license_number: licenseNumber.trim() || null,
      })
      .eq("id", userData.user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profil mis à jour");
  }

  async function onPasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 6) {
      toast.error("Minimum 6 caractères");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    e.currentTarget.reset();
    toast.success("Mot de passe mis à jour");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">Mon profil</h1>
      <p className="mt-2 text-muted-foreground">Mettez à jour vos informations professionnelles.</p>

      <div className="mt-8 rounded-2xl glass-card p-6 shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Courriel</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profession">Profession</Label>
              <Select value={profession} onValueChange={(v) => setProfession(v as Profession)}>
                <SelectTrigger id="profession">
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Numéro de licence professionnelle</Label>
              <Input
                id="license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                maxLength={50}
                placeholder="Optionnel"
              />
            </div>
            <Button type="submit" className="bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />} Enregistrer
            </Button>
          </form>
        )}
      </div>

      <div className="mt-6 rounded-2xl glass-card p-6 shadow-soft">
        <h2 className="text-xl font-bold">Mot de passe</h2>
        <form onSubmit={onPasswordSubmit} className="mt-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le mot de passe</Label>
            <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
          </div>
          <Button type="submit" variant="outline" disabled={passwordSaving}>
            {passwordSaving && <Loader2 className="size-4 animate-spin" />} Modifier le mot de passe
          </Button>
        </form>
      </div>
    </main>
  );
}
