"use server";

import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";

function encodeError(path: string, message: string) {
  const qs = new URLSearchParams({ error: message }).toString();
  return `${path}?${qs}`;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(encodeError("/login", "Credenciales invalidas"));

  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;

  if (!userId) redirect(encodeError("/login", "No se pudo iniciar sesion"));

  const { data: profile } = await supabase.from("users").select("role").eq("id", userId).single();

  redirect(profile?.role === "admin" ? "/admin" : "/dashboard");
}

export async function registerWithInvitationAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const avatarIdRaw = formData.get("avatarId");
  const avatarId = avatarIdRaw ? Number(avatarIdRaw) : null;

  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from("invitations")
    .select("token,email,used")
    .eq("token", token)
    .maybeSingle();

  if (!invitation || invitation.used) {
    redirect(encodeError(`/invite/${token}`, "Invitacion invalida o usada"));
  }

  if (invitation.email.toLowerCase() !== email.toLowerCase()) {
    redirect(encodeError(`/invite/${token}`, "El email no coincide con la invitacion"));
  }

  const { data: authCreated, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createError || !authCreated.user) {
    redirect(encodeError(`/invite/${token}`, createError?.message || "No se pudo crear usuario"));
  }

  const userId = authCreated.user.id;

  const { error: profileError } = await admin.from("users").insert({
    id: userId,
    name,
    email,
    role: "player",
    status: "active",
    avatar_id: avatarId,
    password_hash: null,
  });

  if (profileError) redirect(encodeError(`/invite/${token}`, profileError.message));

  await admin.from("invitations").update({ used: true }).eq("token", token);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect(encodeError("/login", "Usuario creado, inicia sesion manualmente"));

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

