import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "student" | "faculty" | "admin" | "superadmin";

function getFallbackProfileName(user: {
  email?: string;
  user_metadata?: { full_name?: string; name?: string };
}) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User"
  );
}

function getFallbackProfileRole(user: { user_metadata?: { role?: string } }) {
  const role = user.user_metadata?.role;

  if (
    role === "student" ||
    role === "faculty" ||
    role === "admin" ||
    role === "superadmin"
  ) {
    return role;
  }

  return "student" as const;
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (profile) {
    return { user, profile };
  }

  const fallbackProfile = {
    id: user.id,
    full_name: getFallbackProfileName(user),
    role: getFallbackProfileRole(user),
  };

  const { data: createdProfile } = await supabase
    .from("profiles")
    .upsert(fallbackProfile)
    .select("id, full_name, role")
    .single();

  return { user, profile: createdProfile || fallbackProfile };
}

export async function requireUser() {
  const context = await getCurrentUserProfile();

  if (!context.user || !context.profile) {
    redirect("/auth/login");
  }

  return context as {
    user: NonNullable<typeof context.user>;
    profile: { id: string; full_name: string; role: UserRole };
  };
}

export async function requireRole(roles: UserRole[]) {
  const context = await requireUser();

  if (!roles.includes(context.profile.role)) {
    redirect("/dashboard");
  }

  return context;
}
