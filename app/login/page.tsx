'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      router.push(`/login?message=${error.message}`)
      setIsLoading(false)
    }
  }

  return (
    <div className="container container--sm" style={{ padding: '80px 24px', maxWidth: '480px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="nav__logo-mark" style={{ margin: '0 auto 16px', width: '40px', height: '40px', fontSize: '1rem', borderRadius: '10px' }} aria-hidden="true">
          GF
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>Join Groundfloor</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pitch your idea. Get AI-scored. Hear from real founders and investors.</p>
      </div>

      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="btn btn--secondary"
          style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          {isLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        {message && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'var(--red-light)',
            color: 'var(--red)',
            fontSize: '0.8rem',
            borderRadius: 'var(--r-sm)',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '24px' }}>
        By joining, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  )
}
