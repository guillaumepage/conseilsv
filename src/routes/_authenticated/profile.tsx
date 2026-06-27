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
    meta: [{ title: "Mon profil — VacciConseil" }],
  }),
  component: ProfilePage,
});

type Profession = "medecin" | "pharmacien" | "infirmiere" | "etudiant" | "autre";

const PROFESSIONS: { value: Profession; label: string }[] = [
  { value: "medecin", label: "Médecin" },
  { value: "pharmacien", label: "Pharmacien(ne)" },
  { value: "infirmiere", label: "Infirmier(ère)" },
  { value: "etudiant", label: "Étudiant(e)" },
  { value: "autre", label: "Autre" },
];

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [profession, setProfession] = useState<Profession | "">("");
  const [licenseNumber, setLicenseNumber] = useState("");

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
    </main>
  );
}
