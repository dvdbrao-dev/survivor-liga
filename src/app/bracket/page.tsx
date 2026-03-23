import Link from "next/link";
import { getBracketData } from "@/lib/game";

export default async function BracketPage() {
  const data = await getBracketData();
  const survivors = data.users.filter((u) => u.status === "active");
  const eliminated = data.users.filter((u) => u.status !== "active");
  const winner = survivors.length === 1 ? survivors[0] : null;

  const avatarUrl = (avatars: unknown) => {
    if (Array.isArray(avatars)) return avatars[0]?.image_url ?? "/avatars/default.svg";
    return (avatars as { image_url?: string } | null)?.image_url ?? "/avatars/default.svg";
  };

  return (
    <main className="container-app page-stack">
      <header className="card hero" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "2rem", lineHeight: 1 }}>Bracket Survivor</h1>
          <p className="subtitle">Impacto visual de torneo: tension round by round.</p>
        </div>

        <div className="toolbar">
          <Link className="btn btn-secondary" href="/dashboard">
            Dashboard
          </Link>
          <Link className="btn btn-secondary" href="/admin">
            Admin
          </Link>
        </div>
      </header>

      {winner && (
        <section className="card hero" style={{ borderColor: "#3c8261" }}>
          <div className="section-title">
            <h2>Ganador destacado</h2>
            <span className="badge badge-win">Champion</span>
          </div>
          <div className="user-chip" style={{ fontSize: 24, fontWeight: 700 }}>
            <img src={avatarUrl(winner.avatars)} alt={winner.name} className="avatar" style={{ width: 74, height: 74 }} />
            <span>{winner.name}</span>
          </div>
        </section>
      )}

      <section className="grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Supervivientes</h2>
            <span className="badge badge-win">{survivors.length}</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {survivors.map((user) => (
              <article key={user.id} className="round-card" style={{ borderColor: "#2f6f53" }}>
                <div className="user-chip">
                  <img src={avatarUrl(user.avatars)} alt={user.name} className="avatar" style={{ width: 34, height: 34 }} />
                  <strong>{user.name}</strong>
                  <span className="badge badge-win" style={{ marginLeft: "auto" }}>
                    En juego
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Eliminados</h2>
            <span className="badge badge-loss">{eliminated.length}</span>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {eliminated.map((user) => (
              <article key={user.id} className="round-card" style={{ borderColor: "#743b46", opacity: 0.84 }}>
                <div className="user-chip">
                  <img src={avatarUrl(user.avatars)} alt={user.name} className="avatar" style={{ width: 34, height: 34 }} />
                  <strong style={{ textDecoration: "line-through" }}>{user.name}</strong>
                  <span className="badge badge-loss" style={{ marginLeft: "auto" }}>
                    J{user.eliminatedInRound ?? "-"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Supervivientes y eliminados por jornada</h2>
          <span className="badge badge-info">Timeline</span>
        </div>
        <div className="round-timeline">
          {data.rounds.map((round) => (
            <article key={round.id} className="round-card">
              <div className="round-row">
                <strong>Jornada {round.round_number}</strong>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="badge badge-loss">Eliminados: {round.eliminatedCount}</span>
                  <span className="badge badge-win">Supervivientes: {round.survivorsCount}</span>
                  <span className={`badge ${round.status === "resolved" ? "badge-win" : "badge-info"}`}>
                    {round.status}
                  </span>
                </div>
              </div>

              {round.eliminatedUsers.length > 0 ? (
                <div className="eliminated-strip">
                  {round.eliminatedUsers.map((user) => (
                    <div className="eliminated-pill" key={user.id}>
                      <img src={avatarUrl(user.avatars)} alt={user.name} className="avatar" style={{ width: 20, height: 20 }} />
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="badge badge-ghost">Sin eliminados en esta jornada</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

