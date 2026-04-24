"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
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

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (role === "admin" && !serviceRoleKey) {
    redirect(
      `/auth/register?error=${encodeURIComponent(
        "Admin registration requires SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local or use the setup admin page.",
      )}`,
    );
  }

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
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
