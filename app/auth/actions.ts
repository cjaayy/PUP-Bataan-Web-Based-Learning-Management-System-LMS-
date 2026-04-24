"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function normalizeAuthErrorMessage(message: string) {
  if (
    message.includes("For security purposes, you can only request this after")
  ) {
    return "Please wait a moment and try again.";
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

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    redirect(
      `/auth/register?error=${encodeURIComponent(
        normalizeAuthErrorMessage(error?.message || "Registration failed"),
      )}`,
    );
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    redirect(
      `/auth/register?error=${encodeURIComponent(profileError.message)}`,
    );
  }

  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      role,
    },
  });

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
