"use client";

import { useMemo, useState } from "react";

type Avatar = { id: number; name: string; image_url: string };

export function AvatarChoiceField({ avatars, defaultId }: { avatars: Avatar[]; defaultId: number | null }) {
  const initial = useMemo(() => defaultId ?? avatars[0]?.id ?? null, [avatars, defaultId]);
  const [activeId, setActiveId] = useState<number | null>(initial);

  return (
    <div style={{ display: "grid", gap: 8 }}>
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
    </div>
  );
}

