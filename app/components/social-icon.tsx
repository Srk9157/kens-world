import {
  FaGithub, FaInstagram, FaLinkedin, FaYoutube, FaXTwitter,
  FaFacebook, FaTiktok, FaDiscord, FaReddit, FaPinterest,
  FaThreads, FaTelegram, FaWhatsapp, FaTwitch, FaSpotify,
} from 'react-icons/fa6';
import { Globe, Link as LinkIcon } from 'lucide-react';
import type { IconType } from 'react-icons';

const icons: Record<string, IconType> = {
  github: FaGithub,
  instagram: FaInstagram,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  x: FaXTwitter,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  discord: FaDiscord,
  reddit: FaReddit,
  pinterest: FaPinterest,
  threads: FaThreads,
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
  twitch: FaTwitch,
  spotify: FaSpotify,
};

export function SocialIcon({ platform, iconUrl }: { platform: string; iconUrl?: string | null }) {
  // The user-supplied icon lives in the existing owner-upload-only Supabase image bucket.
  if (iconUrl?.startsWith('https://')) {
    return <img className="social-icon-image" src={iconUrl} alt="" aria-hidden="true" />;
  }
  const BrandIcon = icons[platform];
  if (BrandIcon) return <BrandIcon aria-hidden="true" />;
  if (platform === 'website') return <Globe aria-hidden="true" size={19} />;
  return <LinkIcon aria-hidden="true" size={19} />;
}
