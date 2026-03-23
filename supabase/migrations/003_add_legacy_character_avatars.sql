-- 003_add_legacy_character_avatars.sql

-- Keep legacy short slugs out of selector to avoid duplicates.
update public.avatars
set active = false
where slug in ('gravesen', 'drenthe');

insert into public.avatars (name, slug, image_url, active, sort_order)
values
  ('Ivan Campo Ramos', 'ivan-campo', '/avatars/ivan-campo.png', true, 1),
  ('Thomas Gravesen', 'thomas-gravesen', '/avatars/thomas-gravesen.png', true, 2),
  ('Royston Drenthe', 'royston-drenthe', '/avatars/royston-drenthe.png', true, 3),
  ('Jonathan Woodgate', 'jonathan-woodgate', '/avatars/jonathan-woodgate.png', true, 4),
  ('Nordin Amrabat', 'nordin-amrabat', '/avatars/nordin-amrabat.png', true, 5),
  ('Julien Faubert', 'julien-faubert', '/avatars/julien-faubert.png', true, 6),
  ('Antonio Cassano', 'antonio-cassano', '/avatars/antonio-cassano.png', true, 7),
  ('Nicolas Anelka', 'nicolas-anelka', '/avatars/nicolas-anelka.png', true, 8),
  ('Dmytro Chygrynskyi', 'dmytro-chygrynskyi', '/avatars/dmytro-chygrynskyi.png', true, 9),
  ('Javier Saviola', 'javier-saviola', '/avatars/javier-saviola.png', true, 10),
  ('Robert Prosinecki', 'robert-prosinecki', '/avatars/robert-prosinecki.png', true, 11),
  ('Elvir Baljic', 'elvir-baljic', '/avatars/elvir-baljic.png', true, 12),
  ('Oleguer Presas Renom', 'oleguer-presas', '/avatars/oleguer-presas.png', true, 13),
  ('Cicero Joao de Cezare (Cicinho)', 'cicinho', '/avatars/cicinho.png', true, 14),
  ('Walter Samuel', 'walter-samuel', '/avatars/walter-samuel.png', true, 15),
  ('Pablo Garcia Fernandez', 'pablo-garcia', '/avatars/pablo-garcia.png', true, 16),
  ('Antonio Nunez Tena', 'antonio-nunez', '/avatars/antonio-nunez.png', true, 17),
  ('Engonga', 'engonga', '/avatars/engonga.png', true, 18),
  ('Ariza Makukula', 'ariza-makukula', '/avatars/ariza-makukula.png', true, 19)
on conflict (slug) do update
set
  name = excluded.name,
  image_url = excluded.image_url,
  active = excluded.active,
  sort_order = excluded.sort_order;
