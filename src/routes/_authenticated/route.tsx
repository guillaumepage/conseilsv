import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { ensureMyProfile } from "@/lib/user.functions";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const status = await ensureMyProfile();
    if (!status.approved && location.pathname !== "/pending") {
      throw redirect({ to: "/pending" });
    }
    return { user: data.user };
  },
  component: () => (
    <div className="min-h-screen">
      <AppHeader />
      <Outlet />
    </div>
  ),
});
