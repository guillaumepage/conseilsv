import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ADMIN_EMAILS = new Set(["guillaume.page09@gmail.com", "noemie.duval@hotmail.com"]);

async function getAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const ensureMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabaseAdmin = await getAdminClient();
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    if (userError) throw new Error(userError.message);

    const email = userData.user?.email ?? context.claims.email;
    if (!email) throw new Error("Courriel introuvable");

    const normalizedEmail = email.toLowerCase();
    const isSeedAdmin = ADMIN_EMAILS.has(normalizedEmail);

    const { data: existingProfile, error: profileReadError } = await supabaseAdmin
      .from("profiles")
      .select("id, approved")
      .eq("id", context.userId)
      .maybeSingle();
    if (profileReadError) throw new Error(profileReadError.message);

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: context.userId,
        email,
        full_name: (userData.user?.user_metadata?.full_name as string | undefined) ?? null,
        approved: isSeedAdmin,
      });
      if (profileError) throw new Error(profileError.message);
    } else if (isSeedAdmin && !existingProfile.approved) {
      await supabaseAdmin.from("profiles").update({ approved: true }).eq("id", context.userId);
    }

    const role = isSeedAdmin ? "admin" : "user";
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: context.userId, role }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);

    // Re-read final state
    const { data: finalProfile } = await supabaseAdmin
      .from("profiles")
      .select("approved")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: adminRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminRow;
    return { ok: true, approved: isAdmin || !!finalProfile?.approved, isAdmin };
  });
