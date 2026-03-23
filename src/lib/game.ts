import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id,name,email,role,status,avatar_id")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function ensureAdmin() {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") throw new Error("Acceso denegado");
  return profile;
}

export async function getCurrentRound() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rounds")
    .select("*")
    .in("status", ["open", "closed"])
    .order("round_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getDashboardData() {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const round = await getCurrentRound();

  const [{ data: teams }, { data: picks }, { data: activePlayers }, { data: history }, { data: avatars }] =
    await Promise.all([
      supabase.from("teams").select("*").order("name"),
      round
        ? supabase
            .from("picks")
            .select("id,team_id,is_repeated_pick,is_invalid,invalid_reason")
            .eq("user_id", profile.id)
            .eq("round_id", round.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("users")
        .select("id,name,status,avatar_id,avatars(image_url,name)")
        .eq("status", "active")
        .eq("role", "player")
        .order("name"),
      supabase
        .from("picks")
        .select("round_id,team_id,is_invalid,is_repeated_pick,invalid_reason,rounds(round_number,season),teams(name,short_name)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false }),
      supabase.from("avatars").select("id,name,image_url").eq("active", true).order("sort_order"),
    ]);

  const { data: usedTeamIds } = await supabase.from("picks").select("team_id").eq("user_id", profile.id);

  const roundIds = [...new Set((history ?? []).map((x) => x.round_id))];
  const { data: historyResults } =
    roundIds.length > 0
      ? await supabase.from("results").select("round_id,team_id,result").in("round_id", roundIds)
      : { data: [] };
  const resultMap = new Map<string, string>((historyResults ?? []).map((x) => [`${x.round_id}-${x.team_id}`, x.result]));

  const historyWithResult = (history ?? []).map((entry) => ({
    ...entry,
    resolved_result: resultMap.get(`${entry.round_id}-${entry.team_id}`) ?? null,
  }));

  return {
    profile,
    round,
    teams: teams ?? [],
    currentPick: picks,
    usedTeamIds: new Set((usedTeamIds ?? []).map((x) => x.team_id)),
    activePlayers: activePlayers ?? [],
    history: historyWithResult,
    avatars: avatars ?? [],
  };
}

export async function getAdminData() {
  await ensureAdmin();
  const supabase = await createClient();

  const [rounds, teams, users, invitations, notificationLogs, currentRound] = await Promise.all([
    supabase.from("rounds").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("teams").select("*").order("name"),
    supabase
      .from("users")
      .select("id,name,email,status,role,avatar_id,avatars(image_url,name),picks(count)")
      .order("created_at", { ascending: false }),
    supabase.from("invitations").select("*").order("created_at", { ascending: false }).limit(30),
    supabase.from("notification_logs").select("*").order("sent_at", { ascending: false }).limit(20),
    getCurrentRound(),
  ]);

  return {
    rounds: rounds.data ?? [],
    teams: teams.data ?? [],
    users: users.data ?? [],
    invitations: invitations.data ?? [],
    notificationLogs: notificationLogs.data ?? [],
    currentRound,
  };
}

export async function resolveRound(roundId: number) {
  const admin = createAdminClient();

  const [{ data: round }, { data: activeUsers }, { data: roundPicks }, { data: roundResults }] = await Promise.all([
    admin.from("rounds").select("*").eq("id", roundId).single(),
    admin.from("users").select("id,status").eq("status", "active"),
    admin.from("picks").select("*").eq("round_id", roundId),
    admin.from("results").select("team_id,result").eq("round_id", roundId),
  ]);

  if (!round) throw new Error("Jornada no encontrada");

  type RoundPick = { user_id: string; team_id: number; is_invalid: boolean };
  const resultMap = new Map<number, string>((roundResults ?? []).map((x) => [x.team_id, x.result]));
  const picksByUser = new Map<string, RoundPick>((roundPicks ?? []).map((p) => [p.user_id, p as RoundPick]));

  const eliminated: string[] = [];

  for (const user of activeUsers ?? []) {
    const pick = picksByUser.get(user.id);

    if (!pick || pick.is_invalid) {
      eliminated.push(user.id);
      continue;
    }

    const teamResult = resultMap.get(pick.team_id);
    if (teamResult !== "win") eliminated.push(user.id);
  }

  if (eliminated.length > 0) {
    await admin.from("users").update({ status: "eliminated" }).in("id", eliminated);
  }

  await admin.from("rounds").update({ status: "resolved" }).eq("id", roundId);

  const { data: survivors } = await admin.from("users").select("id").eq("status", "active");
  if ((survivors ?? []).length <= 1) {
    await admin.from("rounds").update({ status: "closed" }).eq("status", "open");
  }
}

export async function getBracketData() {
  const supabase = await createClient();

  const [{ data: users }, { data: picks }, { data: rounds }, { data: results }] = await Promise.all([
    supabase
      .from("users")
      .select("id,name,status,role,avatar_id,avatars(image_url,name)")
      .eq("role", "player")
      .order("name"),
    supabase
      .from("picks")
      .select("user_id,round_id,team_id,is_invalid,rounds(round_number)")
      .order("round_id"),
    supabase.from("rounds").select("id,round_number,status").order("round_number"),
    supabase.from("results").select("round_id,team_id,result"),
  ]);

  const allUsers = users ?? [];
  const eliminationRoundByUser = new Map<string, number>();
  const resultMap = new Map<string, string>((results ?? []).map((x) => [`${x.round_id}-${x.team_id}`, x.result]));

  for (const p of picks ?? []) {
    const roundInfo = Array.isArray(p.rounds) ? p.rounds[0] : p.rounds;
    const roundNumber = (roundInfo as { round_number?: number } | null)?.round_number;
    const result = resultMap.get(`${p.round_id}-${p.team_id}`);

    if (!roundNumber) continue;
    if (p.is_invalid || (result && result !== "win")) {
      if (!eliminationRoundByUser.has(p.user_id)) eliminationRoundByUser.set(p.user_id, roundNumber);
    }
  }

  const usersWithElimination = allUsers.map((u) => ({
    ...u,
    eliminatedInRound: eliminationRoundByUser.get(u.id) ?? null,
  }));

  const roundsWithStats = (rounds ?? []).map((round) => {
    const eliminatedUsers = usersWithElimination.filter((u) => u.eliminatedInRound === round.round_number);
    const survivorsAfter = usersWithElimination.filter(
      (u) => u.eliminatedInRound === null || u.eliminatedInRound > round.round_number,
    ).length;

    return {
      ...round,
      eliminatedCount: eliminatedUsers.length,
      survivorsCount: survivorsAfter,
      eliminatedUsers,
    };
  });

  return {
    users: usersWithElimination,
    rounds: roundsWithStats,
  };
}

export async function runDeadlineNotifications() {
  const admin = createAdminClient();

  const { data: openRounds } = await admin.from("rounds").select("*").in("status", ["open", "closed"]);
  const now = Date.now();

  for (const round of openRounds ?? []) {
    const deadlineMs = new Date(round.deadline).getTime();
    const diff = deadlineMs - now;

    if (diff <= 2 * 60 * 1000 && diff > 60 * 1000) {
      const { data: existing } = await admin
        .from("notification_logs")
        .select("id")
        .eq("round_id", round.id)
        .eq("type", "pre_deadline")
        .maybeSingle();
      if (existing) continue;

      const { data: activeUsers } = await admin.from("users").select("id").eq("status", "active");
      const { data: picks } = await admin.from("picks").select("user_id").eq("round_id", round.id);
      const pickedUsers = new Set((picks ?? []).map((x) => x.user_id));
      const recipients = (activeUsers ?? []).filter((u) => !pickedUsers.has(u.id));

      await admin.from("notification_logs").insert({
        round_id: round.id,
        type: "pre_deadline",
        recipients_count: recipients.length,
        donors_count: 0,
      });
    }

    if (diff <= 0) {
      const { data: existing } = await admin
        .from("notification_logs")
        .select("id")
        .eq("round_id", round.id)
        .eq("type", "post_deadline")
        .maybeSingle();
      if (existing) continue;

      const [{ data: activeUsers }, { data: picks }, { data: allUsers }] = await Promise.all([
        admin.from("users").select("id").eq("status", "active"),
        admin.from("picks").select("user_id").eq("round_id", round.id),
        admin.from("users").select("id"),
      ]);

      const pickedUsers = new Set((picks ?? []).map((x) => x.user_id));
      const donorsCount = (activeUsers ?? []).filter((u) => !pickedUsers.has(u.id)).length;

      await admin.from("notification_logs").insert({
        round_id: round.id,
        type: "post_deadline",
        recipients_count: (allUsers ?? []).length,
        donors_count: donorsCount,
      });
    }
  }

  return { ok: true };
}

