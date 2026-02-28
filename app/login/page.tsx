import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams;
  const message = params.message;

  const signInWithGoogle = async () => {
    'use server'
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return redirect(`/login?message=${error.message}`)
    }

    if (data.url) {
      redirect(data.url)
    }
  }

  const signInWithEmail = async (formData: FormData) => {
    'use server'
    const email = formData.get('email') as string
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    if (!email) {
      return redirect('/login?message=Email is required')
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return redirect(`/login?message=${error.message}`)
    }

    return redirect('/login?message=Check your email for the login link!')
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
        <form action={signInWithGoogle}>
          <button type="submit" className="btn btn--secondary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <form action={signInWithEmail}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" className="form-label" style={{ display: 'none' }}>Email address</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              placeholder="founder@startup.com" 
              required
              className="form-input"
              style={{ padding: '12px' }}
            />
          </div>
          <button type="submit" className="btn btn--primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            Send Magic Link
          </button>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: message.includes('Check your email') ? 'var(--green-light)' : 'var(--red-light)', 
            color: message.includes('Check your email') ? 'var(--green)' : 'var(--red)', 
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
