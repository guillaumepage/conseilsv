import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, KeyRound, ShieldAlert } from "lucide-react";
import { listUsers, sendPasswordReset } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administration — VacciConseil" }] }),
  component: AdminPage,
});

function AdminPage() {
  const fetchUsers = useServerFn(listUsers);
  const reset = useServerFn(sendPasswordReset);
  const [pending, setPending] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  async function onReset(email: string) {
    setPending(email);
    try {
      await reset({ data: { email } });
      toast.success(`Lien de réinitialisation envoyé à ${email}`);
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally {
      setPending(null);
    }
  }

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl glass-card p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Accès refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cette page est réservée aux administrateurs.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">Administration</h1>
          <p className="mt-2 text-muted-foreground">
            Gérez les usagers et envoyez des liens de réinitialisation. Les mots de passe restent confidentiels et chiffrés.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Actualiser</Button>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden shadow-soft">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Courriel</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Profession</TableHead>
                <TableHead>Licence</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Abonnement</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{u.full_name ?? "—"}</TableCell>
                  <TableCell>{u.profession ?? "—"}</TableCell>
                  <TableCell>{u.license_number ?? "—"}</TableCell>
                  <TableCell>
                    {u.roles.includes("admin") ? (
                      <Badge className="bg-gradient-brand text-primary-foreground">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Usager</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.subscription_tier === "pro" ? "default" : "outline"}>
                      {u.subscription_tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending === u.email}
                      onClick={() => onReset(u.email)}
                    >
                      {pending === u.email ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <KeyRound className="size-3.5" />
                      )}
                      Réinitialiser
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Aucun usager pour le moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
