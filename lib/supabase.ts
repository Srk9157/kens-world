import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function serverDb() {
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },

        setAll(
          items: {
            name: string;
            value: string;
            options?: import('@supabase/ssr').CookieOptions;
          }[]
        ) {
          try {
            items.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // Cookie updates aren't always allowed here.
          }
        },
      },
    }
  );
}
