import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import { WhatsAppShareButton } from "@/components/whatsapp-share-button";
import {
  closeRoundAction,
  createInvitationAction,
  createRoundAction,
  resolveRoundAction,
  resetCompetitionAction,
  saveResultAction,
  toggleUserStatusAction,
} from "@/lib/game-actions";
import { getAdminData } from "@/lib/game";

function getParam(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  let data;
  try {
    data = await getAdminData();
  } catch {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const notice = getParam(params.notice);
  const error = getParam(params.error);
  const inviteToken = getParam(params.inviteToken);
  const inviteEmail = getParam(params.inviteEmail);
  const inviteUsed = getParam(params.inviteUsed) === "true";

  const baseUrlRaw =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://survivor-liga-taac.vercel.app");
  const baseUrl = baseUrlRaw.replace(/\/$/, "");

  const inviteUrl = (token: string) => `${baseUrl}/invite/${token}`;

  return (
    <main className="container-app page-stack">
      <header className="card hero" style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "2rem", lineHeight: 1 }}>Panel Admin</h1>
          <p className="subtitle">Control de jornadas, usuarios, invitaciones y notificaciones.</p>
        </div>

        <div className="toolbar">
          <Link className="btn btn-secondary" href="/dashboard">
            Vista jugador
          </Link>
          <Link className="btn btn-secondary" href="/bracket">
            Bracket
          </Link>
          <form action={logoutAction}>
            <button className="btn btn-secondary" type="submit">
              Salir
            </button>
          </form>
        </div>
      </header>

      {notice && <div className="alert alert-success">{notice}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {inviteToken && (
        <section className="card">
          <div className="section-title">
            <h2>Invitacion generada</h2>
            <span className="badge badge-win">Success</span>
          </div>
          <p className="subtitle" style={{ marginBottom: 8 }}>
            Invitacion creada correctamente. Puedes copiar o compartir el enlace ahora mismo aunque no haya SMTP configurado.
          </p>

          <div className="invite-result-grid">
            <div>
              <span className="badge badge-info">Email</span>
              <div style={{ marginTop: 6 }}>{inviteEmail || "No disponible"}</div>
            </div>
            <div>
              <span className="badge badge-info">Token</span>
              <div style={{ marginTop: 6 }}>
                <code style={{ wordBreak: "break-all" }}>{inviteToken}</code>
              </div>
            </div>
            <div>
              <span className="badge badge-info">Estado</span>
              <div style={{ marginTop: 6 }}>
                {inviteUsed ? <span className="badge badge-loss">used</span> : <span className="badge badge-win">pending</span>}
              </div>
            </div>
            <div className="invite-link">
              <code>{inviteUrl(inviteToken)}</code>
            </div>
            <div className="invitation-actions">
              <CopyLinkButton value={inviteUrl(inviteToken)} />
              <WhatsAppShareButton inviteUrl={inviteUrl(inviteToken)} />
            </div>
          </div>
        </section>
      )}

      <section className="card">
        <div className="section-title">
          <h2>1. Jornadas</h2>
          <span className="badge badge-info">Gestion activa</span>
        </div>

        <div className="grid-2">
          <div>
            <h3 style={{ marginBottom: 8 }}>Crear jornada</h3>
            <form action={createRoundAction} style={{ display: "grid", gap: 8 }}>
              <input className="input" name="season" placeholder="Temporada (ej: 2026-2027)" required />
              <input className="input" type="number" min={1} name="roundNumber" placeholder="Numero de jornada" required />
              <input className="input" type="datetime-local" name="deadline" required />
              <input className="input" name="timezone" defaultValue="Europe/Madrid" required />
              <button className="btn" type="submit">
                Crear jornada
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: 8 }}>Estado actual</h3>
            {data.currentRound ? (
              <>
                <p className="subtitle" style={{ marginBottom: 8 }}>
                  Jornada {data.currentRound.round_number} · {data.currentRound.status} · Deadline {new Date(data.currentRound.deadline).toLocaleString("es-ES")}
                </p>
                <div className="toolbar" style={{ marginBottom: 10 }}>
                  <form action={closeRoundAction}>
                    <input type="hidden" name="roundId" value={data.currentRound.id} />
                    <button className="btn btn-secondary" type="submit">
                      Cerrar plazo
                    </button>
                  </form>
                  <form action={resolveRoundAction}>
                    <input type="hidden" name="roundId" value={data.currentRound.id} />
                    <button className="btn" type="submit">
                      Resolver jornada
                    </button>
                  </form>
                </div>

                <h3 style={{ margin: "0 0 8px" }}>Resultados manuales</h3>
                <form action={saveResultAction} style={{ display: "grid", gap: 8 }}>
                  <input type="hidden" name="roundId" value={data.currentRound.id} />
                  <select className="input" name="teamId" required>
                    {data.teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  <select className="input" name="result" defaultValue="win">
                    <option value="win">win</option>
                    <option value="draw">draw</option>
                    <option value="loss">loss</option>
                  </select>
                  <button className="btn btn-secondary" type="submit">
                    Guardar resultado
                  </button>
                </form>
              </>
            ) : (
              <div className="alert alert-info">No hay jornada abierta o cerrada en este momento.</div>
            )}
          </div>
        </div>

        <hr style={{ borderColor: "var(--line)", margin: "12px 0" }} />

        <div className="grid-2">
          <div>
            <h3 style={{ marginBottom: 8 }}>Historial reciente</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {data.rounds.map((round) => (
                <div key={round.id} className="badge badge-ghost">
                  J{round.round_number} · {round.status}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: 8 }}>Reset de competicion</h3>
            <form action={resetCompetitionAction} style={{ display: "grid", gap: 8 }}>
              <input className="input" name="newSeason" placeholder="Nueva temporada (ej: 2027-2028)" required />
              <button className="btn btn-danger" type="submit">
                Iniciar nueva temporada
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>2. Usuarios</h2>
          <span className="badge badge-info">{data.users.length} total</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Jornadas jugadas</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user) => {
                const avatars = user.avatars as { name?: string; image_url?: string }[] | { name?: string; image_url?: string } | null | undefined;
                const avatar = Array.isArray(avatars) ? avatars[0] : avatars;
                return (
                  <tr key={user.id}>
                    <td>
                      <span className="user-chip">
                        <img src={avatar?.image_url ?? "/avatars/default.svg"} alt={user.name} className="avatar" style={{ width: 30, height: 30 }} />
                        <span>{user.name}</span>
                      </span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {user.status === "active" && <span className="badge badge-win">active</span>}
                      {user.status === "inactive" && <span className="badge badge-warn">inactive</span>}
                      {user.status === "eliminated" && <span className="badge badge-loss">eliminated</span>}
                    </td>
                    <td>{user.role}</td>
                    <td>{user.picks?.[0]?.count ?? 0}</td>
                    <td>
                      {user.role !== "admin" && (
                        <form action={toggleUserStatusAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <input type="hidden" name="status" value={user.status} />
                          <button className="btn btn-secondary" type="submit">
                            {user.status === "inactive" ? "Activar" : "Desactivar"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>3. Invitaciones</h2>
          <span className="badge badge-info">Token + enlace</span>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 10 }}>
          Aunque no haya sistema de email configurado, puedes compartir manualmente el enlace completo de registro.
        </div>

        <form action={createInvitationAction} style={{ display: "grid", gap: 8, marginBottom: 12, maxWidth: 460 }}>
          <input className="input" type="email" name="email" placeholder="email@dominio.com" required />
          <button className="btn" type="submit">
            Generar invitacion
          </button>
        </form>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Token</th>
                <th>URL registro</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.invitations.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.email}</td>
                  <td>
                    <code style={{ fontSize: "0.78rem", wordBreak: "break-all" }}>{inv.token}</code>
                  </td>
                  <td>
                    <div className="invite-link">
                      <code>{inviteUrl(inv.token)}</code>
                    </div>
                  </td>
                  <td>{inv.used ? <span className="badge badge-loss">used</span> : <span className="badge badge-win">pending</span>}</td>
                  <td>
                    <div className="invitation-actions">
                      <CopyLinkButton value={inviteUrl(inv.token)} />
                      <WhatsAppShareButton inviteUrl={inviteUrl(inv.token)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>4. Notificaciones</h2>
          <span className="badge badge-ghost">Logs</span>
        </div>

        <p className="subtitle" style={{ marginBottom: 10 }}>
          Registro de envios pre/post deadline con deduplicacion por jornada.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Tipo</th>
                <th>Enviado</th>
                <th>Recipientes</th>
                <th>Donantes</th>
              </tr>
            </thead>
            <tbody>
              {data.notificationLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.round_id}</td>
                  <td>{log.type}</td>
                  <td>{new Date(log.sent_at).toLocaleString("es-ES")}</td>
                  <td>{log.recipients_count}</td>
                  <td>{log.donors_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

