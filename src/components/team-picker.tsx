"use client";

import { useEffect, useMemo, useState } from "react";
import { savePick } from "@/lib/game-actions";

type Team = {
  id: number;
  name: string;
  short_name: string;
  logo_url: string;
};

export function TeamPicker({
  teams,
  roundId,
  usedTeamIds,
  currentTeamId,
  deadline,
}: {
  teams: Team[];
  roundId: number;
  usedTeamIds: number[];
  currentTeamId: number | null;
  deadline: string;
}) {
  const [selected, setSelected] = useState<number | null>(currentTeamId);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const locked = nowMs >= new Date(deadline).getTime();

  const isRepeated = useMemo(() => {
    if (!selected) return false;
    return usedTeamIds.includes(selected);
  }, [selected, usedTeamIds]);

  return (
    <div className="card">
      <div className="section-title">
        <h2>Selector de equipos</h2>
        {locked ? <span className="badge badge-loss">Bloqueado</span> : <span className="badge badge-info">Jugada abierta</span>}
      </div>

      <p className="subtitle">
        Estado visual: <span className="badge badge-info">Activo</span> <span className="badge badge-loss">Repetido</span>{" "}
        <span className="badge badge-ghost">Disponible</span>
      </p>

      <div className="team-grid" style={{ marginTop: 10 }}>
        {teams.map((team) => {
          const wasUsed = usedTeamIds.includes(team.id);
          const active = selected === team.id;
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => setSelected(team.id)}
              disabled={locked}
              className={`team-tile${active ? " active" : ""}${wasUsed ? " used" : ""}${locked ? " locked" : ""}`}
            >
              <img src={team.logo_url} alt={team.name} style={{ width: 36, height: 36, objectFit: "contain" }} />
              <div style={{ fontWeight: 700, marginTop: 6 }}>{team.short_name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{team.name}</div>
              <div style={{ marginTop: 6 }}>
                {active && <span className="badge badge-info">Activo</span>}
                {!active && wasUsed && <span className="badge badge-loss">Repetido</span>}
                {!active && !wasUsed && <span className="badge badge-ghost">Libre</span>}
              </div>
            </button>
          );
        })}
      </div>

      {isRepeated && (
        <div className="alert alert-error" style={{ marginTop: 10 }}>
          Pick repetido: se guardara como invalido y podras caer al resolver la jornada.
        </div>
      )}

      {locked && (
        <div className="alert alert-error" style={{ marginTop: 10 }}>
          Deadline cerrado. No se pueden editar picks.
        </div>
      )}

      <form action={savePick} style={{ marginTop: 12 }}>
        <input type="hidden" name="roundId" value={roundId} />
        <input type="hidden" name="teamId" value={selected ?? ""} />
        <button className="btn" type="submit" disabled={locked || !selected}>
          Confirmar pick
        </button>
      </form>
    </div>
  );
}

