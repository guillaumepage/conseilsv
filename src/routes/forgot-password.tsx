import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié — VacciConseil" },
      { name: "description", content: "Demandez une réinitialisation de votre mot de passe." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = z.string().email().safeParse(fd.get("email"));
    if (!email.success) {
      toast.error("Courriel invalide");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <Logo className="h-12 w-12" />
          <span className="text-xl font-bold text-gradient-brand">VacciConseil</span>
        </Link>
        <div className="rounded-3xl glass-card p-8 shadow-elegant">
          <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrez votre courriel et nous vous enverrons un lien de réinitialisation.
          </p>
          {sent ? (
            <div className="mt-6 rounded-lg bg-accent p-4 text-sm">
              Si un compte existe avec ce courriel, un lien vous a été envoyé. Vérifiez votre boîte de réception.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Courriel</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <Button className="w-full bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />} Envoyer le lien
              </Button>
            </form>
          )}
          <p className="mt-6 text-center text-xs">
            <Link to="/auth" className="text-primary hover:underline">← Retour à la connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
