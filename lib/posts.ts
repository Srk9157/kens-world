import {serverDb} from './supabase';
export type Post={id:string;title:string;slug:string;excerpt:string;content:string;cover_url:string|null;category:string;published:boolean;created_at:string;updated_at:string};
export async function getPosts(){const db=await serverDb();const {data}=await db.from('posts').select('*').eq('published',true).order('created_at',{ascending:false});return (data||[]) as Post[]}
