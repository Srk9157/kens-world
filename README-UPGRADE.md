# ken's-world — Journal Search + Editable Journal & About (V4)

This upgrade is made for **Srk9157/kens-world**. It preserves your current blog articles, Supabase login, social links, image uploads, and Vercel Analytics.

## Upgrade checklist (no VS Code required)

### 1. Add one new column in Supabase — DO THIS FIRST

1. Go to https://supabase.com/dashboard and choose the **existing** ken's-world project.
2. Open **SQL Editor > New query**.
3. Open `supabase/upgrade-journal-about.sql` from this ZIP, copy all its contents, paste in the editor and click **Run**.
4. You should get a successful result. This is safe to run multiple times. It does not alter existing articles or social links.
5. Do **not** run the old `schema.sql` again, and do not change your admin email/password.

### 2. Upload the six changed/new files to your existing GitHub repository

Open https://github.com/Srk9157/kens-world (branch **main**). Update these paths using GitHub's pencil editor or `Add file > Upload files`:

- `app/page.tsx` — REPLACE existing
- `app/admin/page.tsx` — REPLACE existing
- `app/admin/studio.tsx` — REPLACE existing
- `app/globals.css` — REPLACE existing (keeps existing dark styling; adds search/settings styles)
- `app/components/journal-search.tsx` — NEW file; create `components` under `app`
- `lib/site-content.ts` — NEW file

**Important:** Do not re-upload every file from this ZIP to GitHub if your site has more recent changes. In particular, keep your existing `app/layout.tsx` and `package.json`, which already have Vercel Analytics installed.

You can copy the files from the `files-to-upload` folder in this ZIP. They are organized under the correct folder structure. Commit to the `main` branch.

### 3. Let Vercel deploy

Go to Vercel > ken's-world > Deployments. Check that the newest deployment corresponds to your **new GitHub commit**, not an old one. When the status is **Ready**, open your homepage and search for a word from an existing article.

### 4. Edit the homepage from Studio

1. Visit https://kens-world.sitey.my/admin (or your working `.vercel.app/admin` address).
2. Sign in.
3. Click **Journal & About** in the Studio toolbar.
4. Change the homepage headline, Journal heading, or About content and press **Save Journal & About**.
5. Open a fresh tab on the public homepage. Changes should be visible immediately; no more GitHub or Vercel edits for future text updates.

### 5. Troubleshooting

- **Save says column site_content does not exist:** Run `supabase/upgrade-journal-about.sql` in the correct Supabase project, then refresh the page.
- **Save says permission denied / no row:** Check your Supabase `is_blog_owner()` policy and that your website login is the configured admin. The existing `site_settings` row `id=1` must exist.
- **Search not visible:** Make sure `app/page.tsx` and `app/components/journal-search.tsx` were uploaded and your newest Vercel deployment is Ready.
- **Vercel build fails:** Read the first red error in Build Logs and check for accidentally copied incomplete files.

## How it works

- Search runs in your reader's browser against the **published articles** already fetched by the homepage. It checks article title, category, excerpt and body text. Drafts are not included. For a very large archive, a future database-backed search would be preferable.
- Journal and About text are stored in the existing `site_settings.site_content` JSON column. Existing Row Level Security (RLS) only allows your authorized admin user to edit it.
- The user-facing search and settings work on mobile and desktop.
- The update does not need new environment variables.
