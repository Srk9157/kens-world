'use client';

import { useState } from 'react';
import { browserDb } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SiteContent } from '@/lib/site-content';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_url: string | null;
  published: boolean;
  updated_at: string;
};

type Panel = 'articles' | 'pages' | 'socials';

const blank = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Ideas',
  cover_url: '',
  published: false,
};

const homepageFields: { key: keyof SiteContent; label: string; multiline?: boolean }[] = [
  { key: 'heroEyebrow', label: 'Small label above welcome' },
  { key: 'heroKicker', label: 'Small label on the right' },
  { key: 'heroIntro', label: 'Welcome headline – first part' },
  { key: 'heroAccent', label: 'Welcome headline – purple part' },
  { key: 'heroSecondLine', label: 'Second headline – first part' },
  { key: 'heroSecondAccent', label: 'Second headline – purple part' },
  { key: 'heroDescription', label: 'Intro paragraph', multiline: true },
  { key: 'journalEyebrow', label: 'Journal section small label' },
  { key: 'journalHeading', label: 'Journal section heading' },
];

const aboutFields: { key: keyof SiteContent; label: string; multiline?: boolean }[] = [
  { key: 'aboutEyebrow', label: 'About section small label' },
  { key: 'aboutHeading', label: 'About heading – first line' },
  { key: 'aboutAccent', label: 'About heading – purple line' },
  { key: 'aboutDescription', label: 'About paragraph', multiline: true },
];

export default function Studio({
  initial,
  initialSocials,
  initialContent,
}: {
  initial: Post[];
  initialSocials: Record<string, string>;
  initialContent: SiteContent;
}) {
  const router = useRouter();
  const db = browserDb();
  const [posts, setPosts] = useState(initial);
  const [socials, setSocials] = useState(initialSocials);
  const [siteContent, setSiteContent] = useState<SiteContent>(initialContent);
  const [panel, setPanel] = useState<Panel>('articles');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function choosePanel(next: Panel) {
    setPanel(next);
    setSettingsMessage('');
    setMessage('');
  }

  function edit(post?: Post) {
    setEditing(post?.id || 'new');
    setPanel('articles');
    setForm(
      post
        ? {
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            cover_url: post.cover_url || '',
            published: post.published,
          }
        : { ...blank }
    );
    setMessage('');
    setPreview(false);
  }

  function field(name: keyof typeof blank, value: string | boolean) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && editing === 'new'
        ? {
            slug: String(value)
              .toLowerCase()
              .normalize('NFKD')
              .replace(/[^a-z0-9 ]/g, '')
              .trim()
              .replace(/\s+/g, '-'),
          }
        : {}),
    }));
  }

  async function save(publish = form.published) {
    setBusy(true);
    setMessage('');
    const payload = {
      ...form,
      published: publish,
      cover_url: form.cover_url || null,
      slug: form.slug.trim().toLowerCase(),
    };
    if (!payload.title.trim() || !payload.slug || !payload.content.trim()) {
      setMessage('Title, URL slug, and article content are required.');
      setBusy(false);
      return;
    }
    const result =
      editing === 'new'
        ? await db.from('posts').insert(payload).select().single()
        : await db.from('posts').update(payload).eq('id', editing).select().single();
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setPosts((old) => [result.data, ...old.filter((item) => item.id !== result.data.id)]);
    setEditing(null);
    router.refresh();
  }

  async function upload(file: File, inline: boolean) {
    setBusy(true);
    setMessage('');
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage('Choose a PNG, JPG, WebP or GIF under 5 MB.');
      setBusy(false);
      return;
    }
    const extension = ({
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
    } as Record<string, string>)[file.type];
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await db.storage.from('blog-images').upload(path, file, { contentType: file.type });
    if (error) {
      setMessage(error.message);
    } else {
      const { data } = db.storage.from('blog-images').getPublicUrl(path);
      if (inline) {
        setForm((old) => ({
          ...old,
          content: `${old.content}\n\n![${file.name.replace(/[\[\]]/g, '')}](${data.publicUrl})\n`,
        }));
        setMessage('Image inserted into your article.');
      } else {
        field('cover_url', data.publicUrl);
      }
    }
    setBusy(false);
  }

  async function saveSocials() {
    setSettingsMessage('');
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(socials)) {
      if (!value.trim()) continue;
      try {
        const parsed = new URL(value.trim());
        if (parsed.protocol !== 'https:') throw new Error('HTTPS only');
        cleaned[key] = parsed.toString();
      } catch {
        setSettingsMessage(`Please enter a complete HTTPS URL for ${key}.`);
        return;
      }
    }
    setBusy(true);
    const { error } = await db
      .from('site_settings')
      .update({ social_links: cleaned })
      .eq('id', 1)
      .select('id')
      .single();
    setBusy(false);
    setSettingsMessage(error ? `Could not save: ${error.message}` : 'Social links saved. Your public footer is updated.');
    if (!error) router.refresh();
  }

  async function saveSiteContent() {
    setSettingsMessage('');
    setBusy(true);
    const { error } = await db
      .from('site_settings')
      .update({ site_content: siteContent })
      .eq('id', 1)
      .select('id')
      .single();
    setBusy(false);
    setSettingsMessage(
      error
        ? `Could not save: ${error.message}. Make sure you ran upgrade-journal-about.sql in Supabase.`
        : 'Journal and About saved! Open your public homepage to see the changes.'
    );
    if (!error) router.refresh();
  }

  function insertMarkdown(before: string, after = '') {
    setForm((old) => ({ ...old, content: `${old.content}\n${before}Your text${after}\n` }));
  }

  async function remove(post: Post) {
    if (!confirm('Permanently delete this article?')) return;
    const { error } = await db.from('posts').delete().eq('id', post.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setPosts((old) => old.filter((item) => item.id !== post.id));
    router.refresh();
  }

  async function logout() {
    await db.auth.signOut();
    window.location.assign('/login');
  }

  function contentFields(fields: typeof homepageFields) {
    return fields.map(({ key, label, multiline }) => (
      <label key={key} className={multiline ? 'span-all' : undefined}>
        {label.toUpperCase()}
        {multiline ? (
          <textarea
            rows={3}
            value={siteContent[key]}
            onChange={(event) => setSiteContent((old) => ({ ...old, [key]: event.target.value }))}
            maxLength={2500}
          />
        ) : (
          <input
            type="text"
            value={siteContent[key]}
            onChange={(event) => setSiteContent((old) => ({ ...old, [key]: event.target.value }))}
            maxLength={160}
          />
        )}
      </label>
    ));
  }

  return (
    <main className="studio">
      <div className="studio-top">
        <div>
          <span className="eyebrow">PRIVATE WORKSPACE</span>
          <h1>Writing Studio<span className="accent">.</span></h1>
        </div>
        <div className="studio-actions">
          <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
          <button className="secondary" type="button" onClick={logout}>Sign out</button>
        </div>
      </div>

      {editing === null ? (
        <>
          <div className="studio-bar">
            <p>{posts.length} articles · {posts.filter((post) => post.published).length} published</p>
            <div className="studio-tabs" aria-label="Writing Studio sections">
              <button type="button" className="secondary" aria-current={panel === 'articles' ? 'page' : undefined} onClick={() => choosePanel('articles')}>Articles</button>
              <button type="button" className="secondary" aria-current={panel === 'pages' ? 'page' : undefined} onClick={() => choosePanel('pages')}>✎ Journal &amp; About</button>
              <button type="button" className="secondary" aria-current={panel === 'socials' ? 'page' : undefined} onClick={() => choosePanel('socials')}>⚙ Social links</button>
              <button type="button" className="button" onClick={() => edit()}>+ New article</button>
            </div>
          </div>

          {message && <p role="alert" className="error">{message}</p>}

          {panel === 'pages' && (
            <section className="settings-panel">
              <span className="eyebrow">WEBSITE SETTINGS / HOMEPAGE</span>
              <h2>Journal &amp; About</h2>
              <p className="settings-intro">Edit the text shown on your homepage. These changes do not edit, delete or unpublish your articles.</p>
              <h3>Welcome &amp; Journal</h3>
              <div className="settings-grid">{contentFields(homepageFields)}</div>
              <h3>About section</h3>
              <div className="settings-grid">{contentFields(aboutFields)}</div>
              <div className="settings-actions">
                <button type="button" className="button" disabled={busy} onClick={saveSiteContent}>
                  {busy ? 'Saving…' : 'Save Journal & About'}
                </button>
                <a href="/" target="_blank" rel="noopener noreferrer">Preview public homepage ↗</a>
                {settingsMessage && <p role="status">{settingsMessage}</p>}
              </div>
            </section>
          )}

          {panel === 'socials' && (
            <section className="settings-panel">
              <span className="eyebrow">WEBSITE SETTINGS</span>
              <h2>Your social connections</h2>
              <p className="settings-intro">Add or change your social links at any time. Leave a field blank to hide it from the public footer.</p>
              {['github', 'instagram', 'linkedin', 'youtube', 'x', 'website'].map((platform) => (
                <label key={platform}>
                  {platform.toUpperCase()}
                  <input
                    type="url"
                    placeholder="https://..."
                    value={socials[platform] || ''}
                    onChange={(event) => setSocials((old) => ({ ...old, [platform]: event.target.value }))}
                  />
                </label>
              ))}
              <div className="settings-actions">
                <button className="button" type="button" disabled={busy} onClick={saveSocials}>Save social links</button>
                {settingsMessage && <p role="status">{settingsMessage}</p>}
              </div>
            </section>
          )}

          {panel === 'articles' && (
            <div className="studio-list">
              {posts.map((post) => (
                <div className="studio-item" key={post.id}>
                  <div>
                    <span className="eyebrow">{post.published ? '● PUBLISHED' : '○ DRAFT'} · {post.category}</span>
                    <h3>{post.title}</h3>
                    <p>/blog/{post.slug}</p>
                  </div>
                  <div>
                    <button type="button" className="secondary" onClick={() => edit(post)}>Edit</button>
                    <button type="button" className="danger" onClick={() => remove(post)}>Delete</button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="empty">
                  <h3>Your stories begin here.</h3>
                  <p>Create a draft or publish your first article.</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="editor">
          <div className="editor-toolbar">
            <button type="button" className="secondary" onClick={() => setEditing(null)}>← Articles</button>
            <div>
              <button type="button" className="secondary" onClick={() => setPreview((old) => !old)}>{preview ? 'Edit' : 'Preview'}</button>
              <button type="button" className="secondary" disabled={busy} onClick={() => save(false)}>Save draft</button>
              <button type="button" className="button" disabled={busy} onClick={() => save(true)}>{busy ? 'Saving…' : 'Publish ↗'}</button>
            </div>
          </div>
          {message && <p role="alert" className="error">{message}</p>}
          {preview ? (
            <article className="prose">
              <h1>{form.title}</h1>
              {form.cover_url && <img src={form.cover_url} alt="Cover preview" />}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content}</ReactMarkdown>
            </article>
          ) : (
            <div className="editor-fields">
              <label>ARTICLE TITLE<input value={form.title} onChange={(event) => field('title', event.target.value)} placeholder="Give your story a title" /></label>
              <label>URL SLUG<input value={form.slug} onChange={(event) => field('slug', event.target.value)} placeholder="my-story" /></label>
              <label>SHORT DESCRIPTION<textarea rows={2} value={form.excerpt} onChange={(event) => field('excerpt', event.target.value)} placeholder="A short introduction for the homepage" /></label>
              <label>CATEGORY<input value={form.category} onChange={(event) => field('category', event.target.value)} /></label>
              <label>
                COVER IMAGE <span className="muted">(max 5 MB)</span>
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file, false); event.target.value = ''; }} />
                {form.cover_url && <img className="cover-preview" src={form.cover_url} alt="Cover preview" />}
              </label>
              <div className="editor-help">
                <button type="button" className="secondary" onClick={() => insertMarkdown('## ')}>+ Heading</button>
                <button type="button" className="secondary" onClick={() => insertMarkdown('**', '**')}>+ Bold</button>
                <button type="button" className="secondary" onClick={() => insertMarkdown('> ')}>+ Quote</button>
                <button type="button" className="secondary" onClick={() => insertMarkdown('- ')}>+ List</button>
                <label className="upload-control">
                  + Insert image
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file, true); event.target.value = ''; }} />
                </label>
              </div>
              <label>
                ARTICLE BODY <span className="muted">Markdown supported · # headings · **bold** · ![alt](image-url)</span>
                <textarea className="body-editor" value={form.content} onChange={(event) => field('content', event.target.value)} placeholder={'# Your first heading\n\nStart writing your story...'} rows={20} />
              </label>
              <p className="muted">Use “Insert image” to upload a photo into your article; move its Markdown line to the desired position.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
