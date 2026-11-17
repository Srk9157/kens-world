import { requireAdmin } from '@/lib/auth';
import { mergeSiteContent } from '@/lib/site-content';
import { normalizeSocialItems } from '@/lib/socials';
import Studio from './studio';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const { db } = await requireAdmin();
  const [{ data: posts }, { data: settings }] = await Promise.all([
    db.from('posts').select('*').order('updated_at', { ascending: false }),
    db.from('site_settings').select('*').eq('id', 1).maybeSingle(),
  ]);
  return (
    <Studio
      initial={posts || []}
      initialSocials={normalizeSocialItems(settings?.social_items, settings?.social_links)}
      initialContent={mergeSiteContent(settings?.site_content)}
    />
  );
}
