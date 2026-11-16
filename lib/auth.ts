import {redirect} from 'next/navigation';import {serverDb} from './supabase';
export async function requireAdmin(){const db=await serverDb();const {data:{user}}=await db.auth.getUser();if(!user || user.email?.toLowerCase()!==process.env.ADMIN_EMAIL?.toLowerCase())redirect('/login');return {db,user}}
