export type SocialItem = {
  id: string;
  platform: string;
  label: string;
  url: string;
  icon_url: string | null;
};

export const SOCIAL_PLATFORMS = [
  { value: 'github', label: 'GitHub' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'discord', label: 'Discord' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'threads', label: 'Threads' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'website', label: 'Website / Portfolio' },
  { value: 'custom', label: 'Other / Custom' },
] as const;

function isSafeUrl(value: string): boolean {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

/** Preserve the prior social_links JSON until the owner saves the new editor once. */
export function normalizeSocialItems(value: unknown, legacy: unknown): SocialItem[] {
  if (Array.isArray(value)) {
    return value.slice(0, 40).flatMap((item, index): SocialItem[] => {
      if (!item || typeof item !== 'object') return [];
      const obj = item as Record<string, unknown>;
      const url = typeof obj.url === 'string' ? obj.url.trim() : '';
      if (!isSafeUrl(url)) return [];
      const label = typeof obj.label === 'string' ? obj.label.trim().slice(0, 80) : '';
      const platform = typeof obj.platform === 'string' ? obj.platform : 'custom';
      const customIcon = typeof obj.icon_url === 'string' && isSafeUrl(obj.icon_url) ? obj.icon_url : null;
      return [{
        id: typeof obj.id === 'string' && obj.id ? obj.id : `social-${index}`,
        label: label || platform,
        platform,
        url,
        icon_url: customIcon,
      }];
    });
  }

  const defaultLegacy: Record<string, string> = { github: 'https://github.com/Srk9157' };
  const links = legacy && typeof legacy === 'object' && !Array.isArray(legacy)
    ? legacy as Record<string, unknown>
    : defaultLegacy;
  return Object.entries(links).flatMap(([platform, link], index): SocialItem[] => {
    if (typeof link !== 'string' || !isSafeUrl(link)) return [];
    const known = SOCIAL_PLATFORMS.find((p) => p.value === platform);
    return [{
      id: `imported-${platform}-${index}`,
      platform: known ? platform : 'custom',
      label: known ? known.label.replace(' (Twitter)', '').replace(' / Portfolio', '') : platform,
      url: link,
      icon_url: null,
    }];
  });
}
