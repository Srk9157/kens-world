# ken's-world — dark personal blog + private publishing studio

A responsive Next.js blog with Supabase database, authentication, image storage, and a private admin editor.

## Setup (15–30 minutes)

1. Install Node.js 20+ and open this folder in VS Code.
2. Create a project at https://supabase.com and copy **Project URL** and **anon / publishable key** from the API settings.
3. In Supabase Authentication > Providers, enable Email. In Authentication > Users, create **one** user with your own email and a strong unique password. Disable public signups in Authentication settings. Enable MFA for your admin account when supported.
4. Open `supabase/schema.sql` and replace `REPLACE_WITH_YOUR_EMAIL@example.com` with your EXACT admin email. Run the entire SQL in Supabase SQL Editor. **This step is essential**: database row-level security enforces your exclusive write access, independently of the interface.
5. Copy `.env.example` to `.env.local` and fill in URL, anon key, and the same admin email (`ADMIN_EMAIL`). **Never use the Supabase service-role key in the frontend or this project.**
6. Your name and GitHub are preconfigured. After login, click **Social links** in Studio to add or update other social platforms without editing code.
7. Run `npm install`, then `npm run dev`; visit http://localhost:3000. Login at `/login`, or click Studio. Create your first post.
8. Deploy to Vercel: push the folder to a private GitHub repo, import it at https://vercel.com, add the same three environment variables in Project Settings, deploy. Set your custom domain in Vercel. Configure your Supabase Auth Site URL to the deployed domain.

## Writing and images

- Dashboard is at `/admin`, accessible on any device over HTTPS after deployment.
- Write in Markdown. Use `# Heading`, `**bold**`, `- list`, `[link](https://...)`, and `![image](https://...)`.
- Cover image upload is built in. Use **Insert image** in the editor to upload and append an inline image to the article.
- Save draft keeps it private. Publish makes it publicly readable. Edit an article and Save draft to unpublish it.
- The public site only shows published articles.

## Security and limitations

- Supabase RLS policies, not merely a hidden admin link, restrict write operations to the designated email account.
- `/admin` uses server-side auth checks. `/login` is public by design, but only the configured user can write.
- Admin credentials must be created in Supabase; this project never includes a preset password.
- Use HTTPS hosting, a strong password, MFA, and disable new user registrations.
- **Email ownership caveat:** Supabase user emails should be verified; protect the Supabase project account as well.
- Public image bucket means uploaded images can be accessed by anyone who knows the image URL, even for drafts. Don't upload private material.
- Rich text is Markdown with formatting shortcuts and preview, not a Word-style WYSIWYG editor. Post scheduling, analytics and comments are not implemented.
- The project is ready for local setup/deployment, but is not deployed or connected to your Supabase account automatically.

## ken's-world customization
- Dark charcoal/purple editorial theme, mobile responsive navigation and smooth hover transitions.
- GitHub: https://github.com/Srk9157 (public footer).
- In `/admin`, click **Social links** to manage GitHub, Instagram, LinkedIn, YouTube, X, and a personal website. Settings are saved to Supabase.
- In the article editor, use **Heading**, **Bold**, **Quote**, **List**, or **Insert image** to simplify writing. Image insertion appends the image at the end of your draft; move the Markdown line wherever you want it.
- If upgrading an existing deployment, rerun the updated `supabase/schema.sql` to create the settings table.
- Only your admin login can publish or edit, enforced by Supabase RLS; do not put credentials in the project.
