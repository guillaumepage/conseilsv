import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, User, Shield, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useQueryClient } from "@tanstack/react-query";

async function loadAdminStatus() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}

export function AppHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    loadAdminStatus().then((status) => {
      if (active) setIsAdmin(status);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadAdminStatus().then((status) => {
        if (active) setIsAdmin(status);
      });
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Logo className="h-10 w-10" />
          <span className="text-lg font-bold text-gradient-brand">ConseilSV</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <LayoutDashboard className="size-4" /> Accueil
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/profile">
              <User className="size-4" /> Profil
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin">
                <Shield className="size-4" /> Admin
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="size-4" /> Déconnexion
          </Button>
        </nav>
      </div>
    </header>
  );
}
