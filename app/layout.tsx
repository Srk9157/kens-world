import './globals.css';
import Link from 'next/link';
import type {Metadata} from 'next';
import {serverDb} from '@/lib/supabase';
import {Analytics} from '@vercel/analytics/next';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:"ken's-world",template:"%s | ken's-world"},description:"Thoughts, ideas, projects and stories from ken's-world."};
const platforms=['github','instagram','linkedin','youtube','x','website'] as const;
const labels:{[key:string]:string}={github:'GitHub',instagram:'Instagram',linkedin:'LinkedIn',youtube:'YouTube',x:'X',website:'Website'};
export default async function RootLayout({children}:{children:React.ReactNode}){
 let links:Record<string,string>={github:'https://github.com/Srk9157'};
 try{const db=await serverDb();const {data}=await db.from('site_settings').select('social_links').eq('id',1).maybeSingle();if(data?.social_links)links={...links,...data.social_links};}catch{}
 return <html lang="en"><body><header className="top"><Link href="/" className="logo">KEN'S<span className="accent">-</span>WORLD<span className="accent">.</span></Link><nav><Link href="/">Journal</Link><Link href="/#about">About</Link><Link href="/#connect">Connect</Link><Link href="/admin" className="adminlink">Studio ↗</Link></nav></header>{children}<footer id="connect"><div><strong>KEN'S-WORLD.</strong><p>Ideas without boundaries.</p></div><div className="socials">{platforms.filter(k=>links[k]?.startsWith('https://')).map(k=><a key={k} href={links[k]} target="_blank" rel="noopener noreferrer">{labels[k]} ↗</a>)}</div><small>© {new Date().getFullYear()} ken's-world</small></footer><Analytics /></body></html>;
}
