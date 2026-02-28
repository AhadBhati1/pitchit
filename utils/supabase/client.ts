import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Fallback for build-time static generation or missing env vars
    return createBrowserClient(
      url || 'https://placeholder.supabase.co',
      anonKey || 'placeholder'
    )
  }

  return createBrowserClient(url, anonKey)
}
