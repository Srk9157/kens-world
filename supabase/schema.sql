-- Run in Supabase SQL Editor. Replace owner email in the policy below.
create extension if not exists pgcrypto;
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(),
 title text not null, slug text not null unique,
 excerpt text not null default '', content text not null default '',
 category text not null default 'Ideas', cover_url text,
 published boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create or replace function public.touch_post() returns trigger language plpgsql as $$ begin new.updated_at=now();return new;end $$;
drop trigger if exists posts_updated on public.posts;
create trigger posts_updated before update on public.posts for each row execute function public.touch_post();
alter table public.posts enable row level security;
create or replace function public.is_blog_owner() returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and lower(coalesce(auth.jwt()->>'email','')) = lower('REPLACE_WITH_YOUR_EMAIL@example.com')
$$;
revoke all on function public.is_blog_owner() from public;
grant execute on function public.is_blog_owner() to authenticated, anon;
drop policy if exists "Public read published" on public.posts;
create policy "Public read published" on public.posts for select using (published = true or public.is_blog_owner());
drop policy if exists "Owner insert" on public.posts;
create policy "Owner insert" on public.posts for insert to authenticated with check (public.is_blog_owner());
drop policy if exists "Owner update" on public.posts;
create policy "Owner update" on public.posts for update to authenticated using (public.is_blog_owner()) with check (public.is_blog_owner());
drop policy if exists "Owner delete" on public.posts;
create policy "Owner delete" on public.posts for delete to authenticated using (public.is_blog_owner());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
 values ('blog-images','blog-images',true,5242880,array['image/png','image/jpeg','image/webp','image/gif'])
 on conflict (id) do nothing;
drop policy if exists "Owner uploads images" on storage.objects;
create policy "Owner uploads images" on storage.objects for insert to authenticated with check (bucket_id='blog-images' and public.is_blog_owner());
drop policy if exists "Owner deletes images" on storage.objects;
create policy "Owner deletes images" on storage.objects for delete to authenticated using (bucket_id='blog-images' and public.is_blog_owner());

-- Editable social media links, owner-only modifications.
create table if not exists public.site_settings (
 id integer primary key check (id=1),
 social_links jsonb not null default '{}'::jsonb
);
insert into public.site_settings(id,social_links)
values (1, '{"github":"https://github.com/Srk9157"}'::jsonb)
on conflict (id) do nothing;
alter table public.site_settings enable row level security;
drop policy if exists "Public view site settings" on public.site_settings;
create policy "Public view site settings" on public.site_settings for select using (true);
drop policy if exists "Owner edit site settings" on public.site_settings;
create policy "Owner edit site settings" on public.site_settings for update to authenticated using (public.is_blog_owner()) with check (public.is_blog_owner());
