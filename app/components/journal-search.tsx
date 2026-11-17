'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Post } from '@/lib/posts';

type Props = { posts: Post[] };

export default function JournalSearch({ posts }: Props) {
  const [query, setQuery] = useState('');
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);

  const matches = useMemo(() => {
    if (!terms.length) return posts;
    return posts.filter((post) => {
      const searchable = [post.title, post.excerpt, post.category, post.content]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return terms.every((term) => searchable.includes(term));
    });
  }, [posts, query]); // Search is client-side and updates instantly.

  return (
    <>
      <div className="journal-search">
        <label htmlFor="journal-keyword" className="journal-search-label">
          SEARCH THE JOURNAL
        </label>
        <div className="journal-search-controls">
          <input
            id="journal-keyword"
            type="search"
            placeholder="Search titles, topics, or words in articles…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          {query && (
            <button type="button" className="secondary journal-search-clear" onClick={() => setQuery('')}>
              Clear
            </button>
          )}
        </div>
        <p className="muted journal-search-result" role="status" aria-live="polite">
          {terms.length
            ? `${matches.length} ${matches.length === 1 ? 'article' : 'articles'} matching “${query.trim()}”`
            : `${posts.length} published ${posts.length === 1 ? 'article' : 'articles'}`}
        </p>
      </div>

      {matches.length ? (
        <div className="posts">
          {matches.map((post, index) => (
            <Link
              className={`post ${!terms.length && index === 0 ? 'featured' : ''}`}
              href={`/blog/${post.slug}`}
              key={post.id}
            >
              <div className="post-image">
                {post.cover_url ? (
                  <img src={post.cover_url} alt="" loading="lazy" />
                ) : (
                  <div className="placeholder">KEN'S-WORLD <span>✳</span></div>
                )}
              </div>
              <div className="post-meta">
                <span>{post.category || 'ESSAY'}</span>
                <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span className="read">READ ARTICLE ↗</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty" role="status">
          {posts.length ? (
            <>
              <span className="eyebrow">NO MATCHES</span>
              <h3>No stories found.</h3>
              <p>Try another keyword, category, or shorter phrase.</p>
              <button className="secondary" onClick={() => setQuery('')}>Show all articles</button>
            </>
          ) : (
            <>
              <span className="eyebrow">COMING SOON</span>
              <h3>Every great story<br />starts somewhere.</h3>
              <p>New stories are on the way. Stay curious.</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
