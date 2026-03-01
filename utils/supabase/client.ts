import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isProd = process.env.NODE_ENV === 'production'
  const isBrowser = typeof window !== 'undefined'

  // In production browser, we ALWAYS use the proxy /supabase
  // This helps bypass India ISP blocks via Vercel rewrites
  const finalUrl = (isProd && isBrowser)
    ? `${window.location.origin}/supabase`
    : (url || 'https://placeholder.supabase.co')

  const finalAnonKey = anonKey || 'placeholder'

  return createBrowserClient(finalUrl, finalAnonKey)
}
