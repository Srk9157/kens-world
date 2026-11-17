# ken's-world v5 — Brand icons + custom social links

## What's new
- Brand icons in the public footer for GitHub, Instagram, LinkedIn, YouTube, X, Facebook, TikTok, Discord, Reddit, Pinterest, Threads, Telegram, WhatsApp, Twitch and Spotify.
- Website / Portfolio gets a globe icon; Other / Custom gets a link icon.
- In Studio > Social links you can add links for any site, set the visible name, reorder, remove, and upload your own custom icon (PNG, JPG, WebP or GIF up to 1 MB).
- Uploaded images use your existing owner-protected Supabase `blog-images` bucket. Custom icons are publicly readable.
- Existing older social links automatically appear until your first save; social links and articles are not erased.

## Install on existing LIVE website (do in this order)
1. BACK UP existing GitHub repository first (Code > Download ZIP).
2. Open Supabase > your EXISTING project > SQL Editor > New query. Copy the content of `supabase/upgrade-social-icons.sql` and click Run.
3. Extract the SMALL `kens-world-social-icons-upgrade.zip`. On GitHub repository `Srk9157/kens-world` (branch main), replace the existing files using the pencil (Edit file) and copy the corresponding full file content. Add new files using Add file > Create new file (paste content), including directory paths.
4. Existing files to replace: `package.json`, `app/layout.tsx`, `app/admin/page.tsx`, `app/admin/studio.tsx`, `app/globals.css`. New files to create: `lib/socials.ts`, `app/components/social-icon.tsx`. The Supabase SQL is run in the Supabase SQL editor; you don't need to commit it.
5. Commit to `main`. Vercel automatically builds the new code. Confirm Deployment status Ready.
6. Open the public website to verify GitHub shows its icon. Open `/admin` > Social links. Add a custom link, choose Other / Custom, enter its name and HTTPS link, upload an icon, and click Save social links.
7. On another device refresh your public blog's footer. Verify clicking each icon opens the intended link.

## Important
- Do **not** upload a ZIP as a single file into your repository. Unzip and apply the directory structure.
- Existing public site and Studio use your current Supabase configuration. Never add passwords or secret keys to GitHub.
- The project keeps the existing Vercel Analytics component and previous Journal / About editor + article search.
- If you see `Could not find the 'social_items' column`, rerun the SQL migration, then refresh the Studio page.
- If an image upload says `row-level security policy`, sign back in with the owner account and check the `blog-images` storage upload policy.
- SVG is intentionally not accepted for custom uploads; use a transparent PNG or WebP icon instead.
- Original `social_links` JSON remains in Supabase for backward compatibility; `social_items` becomes the new editable list.
