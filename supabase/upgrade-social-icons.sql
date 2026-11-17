-- ken's-world V5: Run ONCE in your EXISTING Supabase project's SQL Editor.
-- No password or admin email is needed here. Existing articles, settings and policies are unchanged.
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS social_items jsonb;
-- NULL means legacy social_links still displays until you save the new Studio social editor.
-- An empty array [] after saving means intentionally no public social links.
