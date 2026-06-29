import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Check, Edit3, Loader2, KeyRound, ShieldAlert, X } from "lucide-react";
import { listUsers, sendPasswordReset, setUserAdminRole, setUserApproval, updateUserProfileByAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administration — ConseilSV" }] }),
  component: AdminPage,
});

function AdminPage() {
  const fetchUsers = useServerFn(listUsers);
  const reset = useServerFn(sendPasswordReset);
  const updateProfile = useServerFn(updateUserProfileByAdmin);
  const updateRole = useServerFn(setUserAdminRole);
  const updateApproval = useServerFn(setUserApproval);
  const [pending, setPending] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  async function onReset(email: string) {
    setPending(email);
    try {
      await reset({ data: { email, redirectTo: `${window.location.origin}/reset-password` } });
      toast.success(`Lien de réinitialisation envoyé à ${email}`);
    } catch (e: any) {
      toast.error(e.message ?? "Erreur");
    } finally {
      setPending(null);
    }
  }

  async function onSaveUser(input: AdminUserForm) {
    setPending(input.id);
    try {
      await updateProfile({
        data: {
          userId: input.id,
          email: input.email.trim(),
          fullName: input.full_name.trim() || null,
          profession: input.profession || null,
          licenseNumber: input.license_number.trim() || null,
          subscriptionTier: input.subscription_tier,
        },
      });
      await updateRole({ data: { userId: input.id, isAdmin: input.isAdmin } });
      toast.success("Compte mis à jour");
      setEditingUser(null);
      await refetch();
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
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingUser(u)}>
                        <Edit3 className="size-3.5" />
                        Modifier
                      </Button>
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
                    </div>
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
      <EditUserDialog
        user={editingUser}
        saving={pending === editingUser?.id}
        onClose={() => setEditingUser(null)}
        onSave={onSaveUser}
      />
    </main>
  );
}

type Profession = "medecin" | "pharmacien" | "infirmiere" | "etudiant" | "autre";
type SubscriptionTier = "free" | "pro";
type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  profession: Profession | null;
  license_number: string | null;
  subscription_tier: SubscriptionTier;
  created_at: string;
  roles: string[];
};
type AdminUserForm = {
  id: string;
  email: string;
  full_name: string;
  profession: Profession | "";
  license_number: string;
  subscription_tier: SubscriptionTier;
  isAdmin: boolean;
};

const PROFESSIONS: { value: Profession; label: string }[] = [
  { value: "medecin", label: "Médecin" },
  { value: "pharmacien", label: "Pharmacien(ne)" },
  { value: "infirmiere", label: "Infirmier(ère)" },
  { value: "etudiant", label: "Étudiant(e)" },
  { value: "autre", label: "Autre" },
];

function EditUserDialog({
  user,
  saving,
  onClose,
  onSave,
}: {
  user: AdminUser | null;
  saving: boolean;
  onClose: () => void;
  onSave: (input: AdminUserForm) => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profession, setProfession] = useState<Profession | "">("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email);
    setFullName(user.full_name ?? "");
    setProfession(user.profession ?? "");
    setLicenseNumber(user.license_number ?? "");
    setSubscriptionTier(user.subscription_tier ?? "free");
    setIsAdmin(user.roles.includes("admin"));
  }, [user]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    onSave({
      id: user.id,
      email,
      full_name: fullName,
      profession,
      license_number: licenseNumber,
      subscription_tier: subscriptionTier,
      isAdmin,
    });
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le compte</DialogTitle>
          <DialogDescription>Les mots de passe restent confidentiels et ne sont pas modifiables ici.</DialogDescription>
        </DialogHeader>
        {user && (
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Courriel</Label>
              <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-full-name">Nom complet</Label>
              <Input id="admin-full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Profession</Label>
                <Select value={profession} onValueChange={(v) => setProfession(v as Profession)}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                  <SelectContent>
                    {PROFESSIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Abonnement</Label>
                <Select value={subscriptionTier} onValueChange={(v) => setSubscriptionTier(v as SubscriptionTier)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">free</SelectItem>
                    <SelectItem value="pro">pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-license">Numéro de licence professionnelle</Label>
              <Input id="admin-license" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} maxLength={50} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div>
                <Label>Rôle administrateur</Label>
                <p className="text-xs text-muted-foreground">Donne accès à l’onglet Admin.</p>
              </div>
              <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit" className="bg-gradient-brand text-primary-foreground hover:opacity-90" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />} Enregistrer
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
