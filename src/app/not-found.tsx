import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-app" style={{ maxWidth: 560 }}>
      <section className="card" style={{ marginTop: "14vh" }}>
        <h1>Enlace no valido</h1>
        <p style={{ color: "var(--muted)" }}>La invitacion no existe o ya fue utilizada.</p>
        <Link className="btn" href="/login">
          Ir al login
        </Link>
      </section>
    </main>
  );
}
