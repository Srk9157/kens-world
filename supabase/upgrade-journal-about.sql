-- ken's-world: safe one-time addition for editable Journal and About content.
-- Existing articles, account permissions, image storage and social links are NOT altered.
-- Run this in your EXISTING Supabase project's SQL Editor BEFORE deploying the upgrade.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_content jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Existing owner-only UPDATE policy on public.site_settings also protects site_content.
-- You do NOT need to rerun schema.sql or change any credentials.
