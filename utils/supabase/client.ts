import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isLocal = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const isBrowser = typeof window !== 'undefined'

  // Use the dynamic API proxy in production to bypass India ISP blocks
  const finalUrl = (isBrowser && !isLocal)
    ? `${window.location.origin}/api/supabase`
    : (url || 'https://placeholder.supabase.co')

  const finalAnonKey = anonKey || 'placeholder'

  return createBrowserClient(finalUrl, finalAnonKey, {
    auth: {
      storageKey: 'gf-auth-token',
    },
    cookieOptions: {
      name: 'gf-auth-token',
    }
  })
}
