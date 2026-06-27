import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — VacciConseil" },
      { name: "description", content: "Choisissez un nouveau mot de passe." },
    ],
  }),
  component: ResetPassword,
  ssr: false,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery hash and creates a temporary session
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <Logo className="h-12 w-12" />
          <span className="text-xl font-bold text-gradient-brand">VacciConseil</span>
        </Link>
        <div className="rounded-3xl glass-card p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
          {!ready ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Lien invalide ou expiré. <Link to="/forgot-password" className="text-primary hover:underline">Redemander un lien</Link>.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input id="password" name="password" type="password" required autoComplete="new-password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmer</Label>
                <Input id="confirm" name="confirm" type="password" required autoComplete="new-password" />
              </div>
              <Button className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />} Mettre à jour
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
