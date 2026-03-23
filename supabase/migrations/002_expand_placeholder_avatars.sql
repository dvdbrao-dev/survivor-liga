-- 002_expand_placeholder_avatars.sql
insert into public.avatars (name, slug, image_url, active, sort_order) values
('Alpha One', 'placeholder-01', '/avatars/placeholder-01.svg', true, 7),
('Blaze Two', 'placeholder-02', '/avatars/placeholder-02.svg', true, 8),
('Cobra Three', 'placeholder-03', '/avatars/placeholder-03.svg', true, 9),
('Drift Four', 'placeholder-04', '/avatars/placeholder-04.svg', true, 10),
('Echo Five', 'placeholder-05', '/avatars/placeholder-05.svg', true, 11),
('Fury Six', 'placeholder-06', '/avatars/placeholder-06.svg', true, 12),
('Ghost Seven', 'placeholder-07', '/avatars/placeholder-07.svg', true, 13),
('Hawk Eight', 'placeholder-08', '/avatars/placeholder-08.svg', true, 14),
('Ion Nine', 'placeholder-09', '/avatars/placeholder-09.svg', true, 15),
('Jolt Ten', 'placeholder-10', '/avatars/placeholder-10.svg', true, 16),
('Knox Eleven', 'placeholder-11', '/avatars/placeholder-11.svg', true, 17),
('Lynx Twelve', 'placeholder-12', '/avatars/placeholder-12.svg', true, 18)
on conflict (slug) do nothing;

