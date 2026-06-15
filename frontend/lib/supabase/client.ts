/**
 * Browser-side Supabase client (used in Client Components).
 * Uses createBrowserClient from @supabase/ssr which handles
 * cookie-based session persistence automatically.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
