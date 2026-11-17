import { getPosts } from '@/lib/posts';
import { serverDb } from '@/lib/supabase';
import { mergeSiteContent } from '@/lib/site-content';
import JournalSearch from './components/journal-search';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [posts, content] = await Promise.all([
    getPosts(),
    (async () => {
      try {
        const db = await serverDb();
        const { data } = await db.from('site_settings').select('site_content').eq('id', 1).maybeSingle();
        return mergeSiteContent(data?.site_content);
      } catch {
        return mergeSiteContent(null);
      }
    })(),
  ]);

  return (
    <main>
      <section className="hero">
        <div className="eyebrow">
          {content.heroEyebrow}
          <span>{content.heroKicker}</span>
        </div>
        <h1>
          {content.heroIntro} <em>{content.heroAccent}</em>
          <br />
          {content.heroSecondLine} <em>{content.heroSecondAccent}</em>
        </h1>
        <div className="hero-bottom">
          <p>{content.heroDescription}</p>
          <a href="#articles" className="round-arrow" aria-label="View articles">↘</a>
        </div>
      </section>

      <section id="articles" className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{content.journalEyebrow}</span>
            <h2>{content.journalHeading}<span className="accent">.</span></h2>
          </div>
          <span className="muted">{String(posts.length).padStart(2, '0')} ARTICLES</span>
        </div>
        <JournalSearch posts={posts} />
      </section>

      <section id="about" className="about">
        <span className="eyebrow">{content.aboutEyebrow}</span>
        <h2>{content.aboutHeading}<br /><em>{content.aboutAccent}</em></h2>
        <p className="about-description">{content.aboutDescription}</p>
      </section>
    </main>
  );
}
