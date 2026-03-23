import { notFound } from "next/navigation";
import { registerWithInvitationAction } from "@/app/(auth)/actions";
import { AvatarChoiceField } from "@/components/avatar-choice-field";
import { createAdminClient } from "@/lib/supabase/server";

function getParam(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const error = getParam(query.error);

  const admin = createAdminClient();

  const [{ data: invitation }, { data: avatars }] = await Promise.all([
    admin.from("invitations").select("token,email,used").eq("token", token).maybeSingle(),
    admin.from("avatars").select("id,name,image_url").eq("active", true).order("sort_order"),
  ]);

  if (!invitation || invitation.used) notFound();

  return (
    <main className="container-app" style={{ maxWidth: 760 }}>
      <section className="card hero" style={{ marginTop: "7vh" }}>
        <h1 style={{ fontSize: "2rem", lineHeight: 1 }}>Registro por invitacion</h1>
        <p className="subtitle" style={{ marginBottom: 16 }}>
          Invitacion para <strong>{invitation.email}</strong>
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <form action={registerWithInvitationAction} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="token" value={token} />

          <label>
            Nombre
            <input className="input" type="text" name="name" minLength={2} required />
          </label>

          <label>
            Email
            <input className="input" type="email" name="email" defaultValue={invitation.email} required />
          </label>

          <label>
            Contrasena
            <input className="input" type="password" name="password" minLength={6} required />
          </label>

          <div style={{ display: "grid", gap: 6 }}>
            <strong>Avatar</strong>
            <AvatarChoiceField avatars={avatars ?? []} defaultId={avatars?.[0]?.id ?? null} />
          </div>

          <button className="btn" type="submit">
            Crear cuenta
          </button>
        </form>
      </section>
    </main>
  );
}

