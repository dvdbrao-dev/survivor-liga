"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { ensureAdmin, getCurrentUserProfile, resolveRound } from "@/lib/game";

const roundSchema = z.object({
  season: z.string().min(1),
  roundNumber: z.coerce.number().int().positive(),
  deadline: z.string().min(1),
  timezone: z.string().default("Europe/Madrid"),
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Se produjo un error inesperado";
}

function adminRedirect(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  redirect(qs ? `/admin?${qs}` : "/admin");
}

export async function savePick(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autenticado");

  const roundId = Number(formData.get("roundId"));
  const teamId = Number(formData.get("teamId"));

  const { data: round } = await supabase.from("rounds").select("*").eq("id", roundId).single();
  if (!round || round.status !== "open") throw new Error("La jornada no esta abierta");
  if (new Date(round.deadline).getTime() <= Date.now()) throw new Error("El deadline ya paso");

  const { data: previousPick } = await supabase
    .from("picks")
    .select("id")
    .eq("user_id", profile.id)
    .neq("round_id", roundId)
    .eq("team_id", teamId)
    .limit(1)
    .maybeSingle();

  const isRepeated = Boolean(previousPick);

  await supabase.from("picks").upsert(
    {
      user_id: profile.id,
      round_id: roundId,
      team_id: teamId,
      is_repeated_pick: isRepeated,
      is_invalid: isRepeated,
      invalid_reason: isRepeated ? "repeated_pick" : null,
    },
    { onConflict: "user_id,round_id" },
  );

  revalidatePath("/dashboard");
  revalidatePath("/bracket");
}

export async function updateAvatar(formData: FormData) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) throw new Error("No autenticado");

  const avatarId = Number(formData.get("avatarId"));
  await supabase.from("users").update({ avatar_id: avatarId }).eq("id", profile.id);
  revalidatePath("/dashboard");
  revalidatePath("/bracket");
  revalidatePath("/admin");
}

export async function createRoundAction(formData: FormData) {
  try {
    await ensureAdmin();
    const parsed = roundSchema.parse({
      season: formData.get("season"),
      roundNumber: formData.get("roundNumber"),
      deadline: formData.get("deadline"),
      timezone: formData.get("timezone") || "Europe/Madrid",
    });

    const supabase = await createClient();
    await supabase.from("rounds").insert({
      season: parsed.season,
      round_number: parsed.roundNumber,
      deadline: new Date(parsed.deadline).toISOString(),
      timezone: parsed.timezone,
      status: "open",
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    adminRedirect({ notice: "Jornada creada correctamente" });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

export async function closeRoundAction(formData: FormData) {
  try {
    await ensureAdmin();
    const roundId = Number(formData.get("roundId"));
    const supabase = await createClient();
    await supabase.from("rounds").update({ status: "closed" }).eq("id", roundId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    adminRedirect({ notice: "Plazo de jornada cerrado" });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

export async function saveResultAction(formData: FormData) {
  try {
    await ensureAdmin();
    const roundId = Number(formData.get("roundId"));
    const teamId = Number(formData.get("teamId"));
    const result = String(formData.get("result"));

    const supabase = await createClient();
    await supabase.from("results").upsert(
      {
        round_id: roundId,
        team_id: teamId,
        result,
        source: "manual",
      },
      { onConflict: "round_id,team_id" },
    );

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    adminRedirect({ notice: "Resultado guardado" });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

export async function resolveRoundAction(formData: FormData) {
  try {
    await ensureAdmin();
    const roundId = Number(formData.get("roundId"));
    await resolveRound(roundId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/bracket");
    adminRedirect({ notice: "Jornada resuelta" });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

export async function toggleUserStatusAction(formData: FormData) {
  try {
    await ensureAdmin();
    const userId = String(formData.get("userId"));
    const status = String(formData.get("status"));
    const nextStatus = status === "inactive" ? "active" : "inactive";

    const supabase = await createClient();
    await supabase.from("users").update({ status: nextStatus }).eq("id", userId);
    revalidatePath("/admin");
    revalidatePath("/dashboard");
    adminRedirect({ notice: `Usuario actualizado: ${nextStatus}` });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

export async function createInvitationAction(formData: FormData) {
  try {
    await ensureAdmin();
    const email = String(formData.get("email")).trim();
    const admin = createAdminClient();

    const { data: inserted, error } = await admin
      .from("invitations")
      .insert({ email })
      .select("token,email,used")
      .single();

    if (error || !inserted?.token) throw new Error(error?.message || "No se pudo crear la invitacion");

    revalidatePath("/admin");
    adminRedirect({
      notice: "Invitacion generada y lista para compartir",
      inviteToken: inserted.token,
      inviteEmail: inserted.email,
      inviteUsed: String(Boolean(inserted.used)),
    });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

export async function resetCompetitionAction(formData: FormData) {
  try {
    await ensureAdmin();
    const newSeason = String(formData.get("newSeason"));
    const admin = createAdminClient();

    await admin.from("users").update({ status: "active" }).neq("role", "admin");
    await admin.from("rounds").update({ status: "resolved" }).in("status", ["open", "closed"]);
    await admin.from("meta_state").upsert({ key: "current_season", value: newSeason }, { onConflict: "key" });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    revalidatePath("/bracket");
    adminRedirect({ notice: `Nueva temporada lista: ${newSeason}` });
  } catch (error) {
    adminRedirect({ error: getErrorMessage(error) });
  }
}

