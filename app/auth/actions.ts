"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function getAdminRoleForEmail(email: string) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey);
  const { data } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const matchedUser = data.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!matchedUser?.id) {
    return null;
  }

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", matchedUser.id)
    .maybeSingle<{ role: string }>();

  return {
    id: matchedUser.id,
    role: profile?.role ?? null,
    adminSupabase,
  };
}

function normalizeAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("already registered") ||
    normalized.includes("user already registered") ||
    normalized.includes("duplicate")
  ) {
    return "This email is already registered. Please log in or reset your password.";
  }

  if (
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("too many email requests")
  ) {
    return "Too many signup attempts. Please wait a few minutes and try again.";
  }

  if (
    normalized.includes("user is banned") ||
    normalized.includes("banned") ||
    normalized.includes("not allowed")
  ) {
    return "Your account is deactivated. Please contact an administrator to reactivate it.";
  }

  return message;
}

export async function registerAction(formData: FormData) {
  const supabase = await createClient();
  const fullName = getText(formData, "full_name");
  const email = getText(formData, "email");
  const password = getText(formData, "password");
  const role = getText(formData, "role");

  if (!fullName || !email || !password || !role) {
    redirect("/auth/register?error=Please%20fill%20all%20required%20fields");
  }

  if (role !== "student" && role !== "faculty") {
    redirect(
      `/auth/register?error=${encodeURIComponent(
        "Only student and faculty accounts can be created from this page.",
      )}`,
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceRoleKey) {
    const adminSupabase = createAdminClient(supabaseUrl!, serviceRoleKey);

    const { data: adminData, error: adminError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName,
          role,
        },
        email_confirm: true,
      });

    if (adminError || !adminData.user) {
      redirect(
        `/auth/register?error=${encodeURIComponent(
          normalizeAuthErrorMessage(
            adminError?.message || "Registration failed",
          ),
        )}`,
      );
    }
  } else {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error || !data.user) {
      redirect(
        `/auth/register?error=${encodeURIComponent(
          normalizeAuthErrorMessage(error?.message || "Registration failed"),
        )}`,
      );
    }
  }

  const { data: clientData, error: clientError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (clientError || !clientData.session) {
    redirect(
      `/auth/register?error=${encodeURIComponent(
        normalizeAuthErrorMessage(clientError?.message || "Login failed"),
      )}`,
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = getText(formData, "email");
  const password = getText(formData, "password");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (
      error.message.toLowerCase().includes("banned") ||
      error.message.toLowerCase().includes("not allowed")
    ) {
      const adminAccount = await getAdminRoleForEmail(email);

      if (
        adminAccount?.role === "admin" ||
        adminAccount?.role === "superadmin"
      ) {
        await adminAccount.adminSupabase.auth.admin.updateUserById(
          adminAccount.id,
          {
            ban_duration: "none",
          },
        );

        const retry = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!retry.error && retry.data.session) {
          revalidatePath("/dashboard");
          redirect("/dashboard");
        }
      }

      redirect(
        `/auth/login?error=${encodeURIComponent(
          normalizeAuthErrorMessage(error.message),
        )}`,
      );
    }

    redirect(
      `/auth/login?error=${encodeURIComponent(
        normalizeAuthErrorMessage(error.message),
      )}`,
    );
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
