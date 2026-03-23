import Link from "next/link";
import { loginAction } from "@/app/(auth)/actions";

function getParam(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = getParam(params.error);

  return (
    <main className="container-app" style={{ maxWidth: 520 }}>
      <section className="card hero" style={{ marginTop: "10vh" }}>
        <h1 style={{ fontSize: "2rem", lineHeight: 1 }}>Survivor Liga</h1>
        <p className="subtitle" style={{ marginBottom: 14 }}>
          Accede con tu email y contrasena para competir en modo supervivencia.
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <form action={loginAction} style={{ display: "grid", gap: 12 }}>
          <label>
            Email
            <input className="input" type="email" name="email" required />
          </label>

          <label>
            Contrasena
            <input className="input" type="password" name="password" minLength={6} required />
          </label>

          <button className="btn" type="submit">
            Entrar
          </button>
        </form>

        <p className="subtitle" style={{ marginTop: 14 }}>
          El alta solo es por invitacion. Si recibiste enlace directo, abrelo para registrarte.
        </p>

        <p style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
          Ejemplo: <Link href="/invite/00000000-0000-0000-0000-000000000000">/invite/&lt;token&gt;</Link>
        </p>
      </section>
    </main>
  );
}

