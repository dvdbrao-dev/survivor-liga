import { NextResponse } from "next/server";
import { runDeadlineNotifications } from "@/lib/game";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDeadlineNotifications();
  return NextResponse.json(result);
}
