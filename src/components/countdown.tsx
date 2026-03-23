"use client";

import { useEffect, useMemo, useState } from "react";

function splitTime(ms: number) {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function Countdown({ deadline }: { deadline: string }) {
  const [left, setLeft] = useState(() => new Date(deadline).getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setLeft(new Date(deadline).getTime() - Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, [deadline]);

  const expired = left <= 0;
  const parts = useMemo(() => splitTime(left), [left]);

  return (
    <div className={`countdown-shell${expired ? " expired" : ""}`}>
      <div className="section-title" style={{ marginBottom: 0 }}>
        <span className={`badge ${expired ? "badge-loss" : "badge-warn"}`}>
          {expired ? "Plazo cerrado" : "Cuenta atras"}
        </span>
        {!expired && <span style={{ color: "#ffd89d", fontSize: 12 }}>Tension de jornada</span>}
      </div>

      <div className="countdown-grid">
        <div className="countdown-cell">
          <div className="countdown-value">{pad(parts.days)}</div>
          <div className="countdown-label">Dias</div>
        </div>
        <div className="countdown-cell">
          <div className="countdown-value">{pad(parts.hours)}</div>
          <div className="countdown-label">Horas</div>
        </div>
        <div className="countdown-cell">
          <div className="countdown-value">{pad(parts.minutes)}</div>
          <div className="countdown-label">Min</div>
        </div>
        <div className="countdown-cell">
          <div className="countdown-value">{pad(parts.seconds)}</div>
          <div className="countdown-label">Seg</div>
        </div>
      </div>
    </div>
  );
}

