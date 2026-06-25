-- ============================================================================
-- Eucalipto Tratado Premium — Esquema do banco de dados (Supabase)
-- ============================================================================
-- Como usar:
--   1. Abra o painel do Supabase do projeto deste site.
--   2. Vá em "SQL Editor" -> "New query".
--   3. Cole TODO este arquivo e clique em "Run".
--   4. Depois, crie o usuário administrador (instruções no final do arquivo).
--
-- O script é idempotente: pode ser executado novamente sem causar erros.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABELAS
-- ----------------------------------------------------------------------------

-- Registros de visitas ao site (analytics)
create table if not exists public.visits (
  id          uuid primary key default gen_random_uuid(),
  user_agent  text,
  region      text,
  city        text,
  country     text,
  created_at  timestamptz not null default now()
);

-- Conteúdo editável do site (imagens principais, banners, promoção, etc.)
-- "type" identifica a seção (ex.: hero, about, medicao, sust1, promotion...)
-- "active" indica qual registro daquele tipo está em uso.
create table if not exists public.site_content (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  url         text,
  link        text,
  active      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Galeria de imagens por categoria (rural, civil, paisagismo, ideias)
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  category    text not null,
  "order"     integer default 0,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
alter table public.visits        enable row level security;
alter table public.site_content  enable row level security;
alter table public.gallery       enable row level security;

-- VISITS: qualquer visitante pode registrar uma visita;
--         apenas o admin pode ler os dados de analytics.
drop policy if exists "visits_insert_anyone" on public.visits;
create policy "visits_insert_anyone" on public.visits
  for insert to anon, authenticated
  with check (true);

drop policy if exists "visits_select_admin" on public.visits;
create policy "visits_select_admin" on public.visits
  for select to authenticated
  using (auth.jwt() ->> 'email' = 'fazendajt@gmail.com');

-- SITE_CONTENT: leitura pública; escrita apenas pelo admin.
drop policy if exists "site_content_select_public" on public.site_content;
create policy "site_content_select_public" on public.site_content
  for select to anon, authenticated
  using (true);

drop policy if exists "site_content_write_admin" on public.site_content;
create policy "site_content_write_admin" on public.site_content
  for all to authenticated
  using      (auth.jwt() ->> 'email' = 'fazendajt@gmail.com')
  with check (auth.jwt() ->> 'email' = 'fazendajt@gmail.com');

-- GALLERY: leitura pública; escrita apenas pelo admin.
drop policy if exists "gallery_select_public" on public.gallery;
create policy "gallery_select_public" on public.gallery
  for select to anon, authenticated
  using (true);

drop policy if exists "gallery_write_admin" on public.gallery;
create policy "gallery_write_admin" on public.gallery
  for all to authenticated
  using      (auth.jwt() ->> 'email' = 'fazendajt@gmail.com')
  with check (auth.jwt() ->> 'email' = 'fazendajt@gmail.com');

-- ----------------------------------------------------------------------------
-- STORAGE: bucket público "images"
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Leitura pública das imagens (o bucket público já serve via URL pública;
-- esta policy garante acesso de leitura também pela API de storage).
drop policy if exists "images_select_public" on storage.objects;
create policy "images_select_public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'images');

-- Upload / atualização / exclusão de imagens apenas pelo admin.
drop policy if exists "images_insert_admin" on storage.objects;
create policy "images_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and auth.jwt() ->> 'email' = 'fazendajt@gmail.com');

drop policy if exists "images_update_admin" on storage.objects;
create policy "images_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and auth.jwt() ->> 'email' = 'fazendajt@gmail.com');

drop policy if exists "images_delete_admin" on storage.objects;
create policy "images_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and auth.jwt() ->> 'email' = 'fazendajt@gmail.com');

-- ============================================================================
-- USUÁRIO ADMINISTRADOR (passo manual)
-- ============================================================================
-- O login do painel admin é restrito ao e-mail: fazendajt@gmail.com
--
-- Crie o usuário pelo painel do Supabase (NÃO insira direto em auth.users):
--   1. Authentication -> Users -> "Add user" -> "Create new user".
--   2. Email: fazendajt@gmail.com
--   3. Defina uma senha.
--   4. Marque "Auto Confirm User" (confirmar e-mail automaticamente).
--
-- (Opcional) Para usar outro e-mail de admin, troque "fazendajt@gmail.com"
-- em TODAS as policies acima E na constante do código-fonte
-- (src/App.tsx e src/components/AdminDashboard.tsx).
-- ============================================================================
