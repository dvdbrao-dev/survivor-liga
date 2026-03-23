import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resolveRound } from "@/lib/game";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: rounds } = await admin.from("rounds").select("id,deadline,status").eq("status", "closed");

  const now = Date.now();
  const processed: number[] = [];

  for (const round of rounds ?? []) {
    if (new Date(round.deadline).getTime() <= now) {
      await resolveRound(round.id);
      processed.push(round.id);
    }
  }

  return NextResponse.json({ processed });
}
