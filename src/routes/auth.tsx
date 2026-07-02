import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

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


const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Connexion — ConseilSV" },
      { name: "description", content: "Connectez-vous à ConseilSV ou créez votre compte." },
    ],
  }),
  component: AuthPage,
});

const credsSchema = z.object({
  email: z.string().trim().email("Courriel invalide").max(255),
  password: z.string().min(6, "Min. 6 caractères").max(128),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode ?? "signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <Logo className="h-12 w-12" />
          <span className="text-xl font-bold text-gradient-brand">ConseilSV</span>
        </Link>

        <div className="rounded-3xl glass-card p-8 shadow-elegant">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm onDone={() => setTab("signin")} />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Retour à l'accueil</Link>
        </p>
      </div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = credsSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Identifiants invalides");
      return;
    }
    toast.success("Connexion réussie");
    navigate({ to: "/dashboard" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Courriel</Label>
        <Input id="signin-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Mot de passe</Label>
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">
            Oublié ?
          </Link>
        </div>
        <Input id="signin-password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} Se connecter
      </Button>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  const [profession, setProfession] = useState<Profession | "">("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = credsSchema.safeParse({
      email: fd.get("email"),
      password: fd.get("password"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const fullName = String(fd.get("full_name") ?? "").trim();
    const licenseNumber = String(fd.get("license_number") ?? "").trim();
    if (!fullName) {
      toast.error("Le nom complet est requis");
      return;
    }
    if (!profession) {
      toast.error("La profession est requise");
      return;
    }
    setLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      ...parsed.data,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }
    // Save profession + license immediately (user session exists since email confirm is disabled)
    if (signUpData.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          profession: profession as Profession,
          license_number: licenseNumber || null,
        })
        .eq("id", signUpData.user.id);
      // Sign out so user must explicitly log in (and hits the pending gate)
      await supabase.auth.signOut();
    }
    setLoading(false);
    toast.success(
      "Compte créé ! Un administrateur doit approuver votre accès avant que vous puissiez utiliser ConseilSV. Vous pouvez vous connecter, mais l'accès au tableau de bord sera bloqué en attendant l'approbation.",
      { duration: 8000 }
    );
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Nom complet *</Label>
        <Input id="signup-name" name="full_name" autoComplete="name" required maxLength={100} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Courriel *</Label>
        <Input id="signup-email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Mot de passe *</Label>
        <Input id="signup-password" name="password" type="password" autoComplete="new-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-profession">Profession *</Label>
        <Select value={profession} onValueChange={(v) => setProfession(v as Profession)}>
          <SelectTrigger id="signup-profession">
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
        <Label htmlFor="signup-license">Numéro de licence professionnelle</Label>
        <Input id="signup-license" name="license_number" maxLength={50} placeholder="Optionnel" />
      </div>
      <Button type="submit" className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />} Créer mon compte
      </Button>
    </form>
  );
}
