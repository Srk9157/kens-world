/** Public homepage copy that the admin can update without redeploying. */
export const defaultSiteContent = {
  heroEyebrow: '✳ A PERSONAL SPACE ON THE INTERNET',
  heroKicker: 'EST. 2026',
  heroIntro: 'Welcome to',
  heroAccent: "ken's-world.",
  heroSecondLine: 'Ideas without',
  heroSecondAccent: 'boundaries.',
  heroDescription: 'Exploring technology, creativity, business, personal projects and everything worth thinking about.',
  journalEyebrow: '01 / THE ARCHIVE',
  journalHeading: 'Latest writing',
  aboutEyebrow: '02 / ABOUT THIS SPACE',
  aboutHeading: 'A place for curiosity,',
  aboutAccent: 'without limits.',
  aboutDescription: "Welcome to ken's-world — a personal archive of discoveries, experiments, ideas and stories.",
};

export type SiteContent = typeof defaultSiteContent;

/** Protect rendering against unexpected/null JSON values in the DB. */
export function mergeSiteContent(raw: unknown): SiteContent {
  const content: SiteContent = { ...defaultSiteContent };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return content;
  const source = raw as Record<string, unknown>;
  for (const key of Object.keys(defaultSiteContent) as (keyof SiteContent)[]) {
    if (typeof source[key] === 'string') content[key] = source[key] as string;
  }
  return content;
}
