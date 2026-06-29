import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/pending")({
  head: () => ({ meta: [{ title: "En attente d'approbation — ConseilSV" }] }),
  component: PendingPage,
});

function PendingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground shadow-glow">
        <Clock className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">Compte en attente d'approbation</h1>
      <p className="mt-3 max-w-lg text-muted-foreground">
        Merci pour votre inscription. Un administrateur doit approuver votre compte avant
        que vous puissiez accéder au portail ConseilSV. Vous recevrez l'accès dès que
        votre demande aura été validée.
      </p>
      <Button variant="outline" className="mt-8" onClick={signOut}>
        <LogOut className="size-4" /> Se déconnecter
      </Button>
    </main>
  );
}
