"use client";

import { useMemo, useState } from "react";
import { updateAvatar } from "@/lib/game-actions";

type Avatar = { id: number; name: string; image_url: string };

export function AvatarSelector({ avatars, selectedId }: { avatars: Avatar[]; selectedId: number | null }) {
  const defaultAvatarId = useMemo(() => selectedId ?? avatars[0]?.id ?? null, [avatars, selectedId]);
  const [activeId, setActiveId] = useState<number | null>(defaultAvatarId);

  return (
    <div className="card">
      <div className="section-title">
        <h2>Avatar</h2>
        <span className="badge badge-info">Galeria local</span>
      </div>

      <form action={updateAvatar} style={{ display: "grid", gap: 10 }}>
        <input type="hidden" name="avatarId" value={activeId ?? ""} />

        <div className="avatar-gallery avatar-gallery-rich">
          {avatars.map((avatar) => {
            const active = avatar.id === activeId;
            return (
              <button
                key={avatar.id}
                type="button"
                className={`avatar-tile${active ? " active" : ""}`}
                onClick={() => setActiveId(avatar.id)}
                aria-pressed={active}
              >
                <img src={avatar.image_url} alt={avatar.name} />
                <div className="avatar-tile-name">{avatar.name}</div>
                {active && <div className="avatar-tile-picked">Seleccionado</div>}
              </button>
            );
          })}
        </div>

        <button className="btn" type="submit" disabled={!activeId}>
          Guardar avatar
        </button>
      </form>
    </div>
  );
}

