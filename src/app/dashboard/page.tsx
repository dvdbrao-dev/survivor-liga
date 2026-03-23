import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { AvatarSelector } from "@/components/avatar-selector";
import { Countdown } from "@/components/countdown";
import { TeamPicker } from "@/components/team-picker";
import { getDashboardData } from "@/lib/game";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/login");

  const { profile, round, teams, usedTeamIds, currentPick, activePlayers, history, avatars } = data;

  const avatarUrl = (avatarRef: unknown) => {
    if (Array.isArray(avatarRef)) return avatarRef[0]?.image_url ?? "/avatars/default.svg";
    return (avatarRef as { image_url?: string } | null)?.image_url ?? "/avatars/default.svg";
  };

  const profileAvatar = avatars.find((avatar) => avatar.id === profile.avatar_id)?.image_url ?? "/avatars/default.svg";

  return (
    <main className="container-app page-stack">
      <header className="card hero" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={profileAvatar} alt={profile.name} className="avatar" style={{ width: 56, height: 56 }} />
          <div>
            <h1 style={{ fontSize: "2rem", lineHeight: 1 }}>Survivor Liga Dashboard</h1>
            <p className="subtitle">{profile.name}</p>
            <div style={{ marginTop: 6 }}>
              {profile.status === "active" && <span className="badge badge-win">Activo</span>}
              {profile.status === "eliminated" && <span className="badge badge-loss">Eliminado</span>}
              {profile.status === "inactive" && <span className="badge badge-warn">Inactivo</span>}
            </div>
          </div>
        </div>

        <div className="toolbar">
          <Link className="btn btn-secondary" href="/bracket">
            Torneo
          </Link>
          <form action={logoutAction}>
            <button className="btn btn-secondary" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      <section className="grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Jornada actual</h2>
            {round ? <span className="badge badge-info">J{round.round_number}</span> : <span className="badge badge-ghost">Sin jornada</span>}
          </div>

          {round ? (
            <>
              <p className="subtitle" style={{ marginBottom: 10 }}>
                Temporada {round.season} · Deadline: {new Date(round.deadline).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })} ({round.timezone})
              </p>
              <Countdown deadline={round.deadline} />
              {currentPick && (
                <div className="alert alert-info" style={{ marginTop: 10 }}>
                  Pick actual: <strong>{teams.find((t) => t.id === currentPick.team_id)?.name}</strong>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-info">No hay jornada abierta.</div>
          )}
        </div>

        <AvatarSelector avatars={avatars} selectedId={profile.avatar_id} />
      </section>

      {round && (
        <TeamPicker
          teams={teams}
          roundId={round.id}
          usedTeamIds={[...usedTeamIds]}
          currentTeamId={currentPick?.team_id ?? null}
          deadline={round.deadline}
        />
      )}

      <section className="grid-2">
        <div className="card">
          <div className="section-title">
            <h2>Supervivientes</h2>
            <span className="badge badge-win">{activePlayers.length}</span>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {activePlayers.map((player) => (
              <li key={player.id} className="user-chip">
                <img src={avatarUrl(player.avatars)} alt={player.name} className="avatar" style={{ width: 30, height: 30 }} />
                <span>{player.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="section-title">
            <h2>Historial personal</h2>
            <span className="badge badge-ghost">{history.length} picks</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Jornada</th>
                  <th>Equipo</th>
                  <th>Estado</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, idx) => {
                  const result = entry.resolved_result;
                  const invalid = entry.is_invalid;
                  const repeated = entry.is_repeated_pick;
                  const roundInfo = Array.isArray(entry.rounds) ? entry.rounds[0] : entry.rounds;
                  const teamInfo = Array.isArray(entry.teams) ? entry.teams[0] : entry.teams;
                  return (
                    <tr key={`${entry.round_id}-${idx}`}>
                      <td>{roundInfo?.round_number}</td>
                      <td>{teamInfo?.name}</td>
                      <td>
                        {invalid ? (
                          <span className="badge badge-loss">Invalido {entry.invalid_reason ? `(${entry.invalid_reason})` : ""}</span>
                        ) : repeated ? (
                          <span className="badge badge-loss">Repetido</span>
                        ) : (
                          <span className="badge badge-win">Valido</span>
                        )}
                      </td>
                      <td>
                        {result === "win" && <span className="badge badge-win">Win</span>}
                        {result === "draw" && <span className="badge badge-warn">Draw</span>}
                        {result === "loss" && <span className="badge badge-loss">Loss</span>}
                        {!result && <span className="badge badge-ghost">Pendiente</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

