import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import { serverDb } from '@/lib/supabase';
import { normalizeSocialItems, type SocialItem } from '@/lib/socials';
import { SocialIcon } from '@/app/components/social-icon';
import { Analytics } from '@vercel/analytics/next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { default: "ken's-world", template: "%s | ken's-world" },
  description: "Thoughts, ideas, projects and stories from ken's-world.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let socials: SocialItem[] = normalizeSocialItems(null, { github: 'https://github.com/Srk9157' });
  try {
    const db = await serverDb();
    // select('*') avoids crashing the public site if the optional migration hasn't run yet.
    const { data } = await db.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (data) socials = normalizeSocialItems(data.social_items, data.social_links);
  } catch { /* Render site even when settings backend is temporarily unavailable. */ }

  return (
    <html lang="en">
      <body>
        <header className="top">
          <Link href="/" className="logo">KEN'S<span className="accent">-</span>WORLD<span className="accent">.</span></Link>
          <nav>
            <Link href="/">Journal</Link>
            <Link href="/#about">About</Link>
            <Link href="/#connect">Connect</Link>
            <Link href="/admin" className="adminlink">Studio ↗</Link>
          </nav>
        </header>
        {children}
        <footer id="connect">
          <div><strong>KEN'S-WORLD.</strong><p>Ideas without boundaries.</p></div>
          <div className="socials" aria-label="Social media links">
            {socials.map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.label} title={item.label}>
                <SocialIcon platform={item.platform} iconUrl={item.icon_url} />
                <span>{item.label}</span>
              </a>
            ))}
          </div>
          <small>© {new Date().getFullYear()} ken's-world</small>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
