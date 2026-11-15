"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { errors: { password: ["Ingresa la contraseña"] } };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.APP_AUTH_EMAIL!,
    password,
  });
  if (error) {
    return { errors: { password: ["Contraseña incorrecta"] } };
  }
  redirect("/");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
