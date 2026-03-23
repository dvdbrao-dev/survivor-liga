import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/game";

export default async function HomePage() {
  const profile = await getCurrentUserProfile();

  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  redirect("/dashboard");
}
