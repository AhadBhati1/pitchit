'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VideoUploader from '@/components/VideoUploader'
import { createClient } from '@/utils/supabase/client'

export default function SubmitPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [step, setStep] = useState(1)

  useEffect(() => {
    const supabase = createClient()
    async function checkAuthAndOnboarding() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Check if onboarding is completed
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (profile && !profile.onboarding_completed) {
          router.push('/onboarding')
          return
        }
      }
      setCheckingAuth(false)
    }
    checkAuthAndOnboarding()
  }, [router])

  // Form State
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [stage, setStage] = useState('')
  const [industry, setIndustry] = useState('')
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext1 = () => {
    if (!videoUrl) {
      alert('Please upload a video first.')
      return
    }
    setStep(2)
  }

  const handleNext2 = () => {
    if (!problem.trim() || !solution.trim()) {
      alert('Please fill in both problem and solution.')
      return
    }
    setStep(3)
  }

  const handleNext3 = () => {
    if (!stage || !industry) {
      alert('Please select both a stage and industry.')
      return
    }
    setStep(4)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          problem,
          solution,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          industry,
          stage,
          bio
        })
      })

      if (!res.ok) {
        throw new Error('Failed to submit pitch')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      alert('Submission failed. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (checkingAuth) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>Checking authorization...</div>
  }

  if (!user) {
    return (
      <div className="container container--sm" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px' }}>Authentication Required</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Please sign in with Google to submit your 60-second pitch.
        </p>
        <button onClick={() => router.push('/login')} className="btn btn--primary">
          Sign in to Continue
        </button>
      </div>
    )
  }

  return (
    <div className="container container--sm" style={{ padding: '48px 24px 80px' }}>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '6px' }}>Submit your pitch</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>60 seconds. No deck. No gatekeeping.</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps" role="list">
        {[1, 2, 3, 4].map(num => (
          <div key={num} style={{ display: 'contents' }}>
            <div className={`progress-step ${step === num ? 'active' : step > num ? 'done' : ''}`} role="listitem">
              <div className="progress-step__dot">{num}</div>
              <div className="progress-step__label">
                {num === 1 && 'Video'}
                {num === 2 && 'Pitch'}
                {num === 3 && 'Details'}
                {num === 4 && 'Review'}
              </div>
            </div>
            {num < 4 && <div className="progress-line" aria-hidden="true"></div>}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      <div className={`step-panel ${step === 1 ? 'active' : ''}`}>
        <VideoUploader onUploadSuccess={(url, thumb) => {
          setVideoUrl(url)
          setThumbnailUrl(thumb)
        }} />

        <div style={{ marginTop: '24px', padding: '14px', background: 'var(--bg)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>
            What makes a great 60-second pitch
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span>— State the problem in your first 10 seconds</span>
            <span>— Explain your solution simply — no jargon</span>
            <span>— Say why you are the right person to build this</span>
            <span>— Don't dress it up. Raw and clear beats polished and vague.</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button className="btn btn--primary" onClick={handleNext1}>Continue →</button>
        </div>
      </div>

      {/* STEP 2 */}
      <div className={`step-panel ${step === 2 ? 'active' : ''}`}>
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label">Problem <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one sentence — be brutal)</span></label>
          <textarea
            className="form-textarea" rows={2} maxLength={160}
            placeholder="Small businesses wait 47 days on average to get approved for a loan."
            value={problem} onChange={e => setProblem(e.target.value)}
          />
          <div className="char-count">{problem.length}/160</div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">Solution <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(one sentence — be specific)</span></label>
          <textarea
            className="form-textarea" rows={2} maxLength={160}
            placeholder="We underwrite SMB loans in 4 minutes using real-time cash flow data instead of credit scores."
            value={solution} onChange={e => setSolution(e.target.value)}
          />
          <div className="char-count">{solution.length}/160</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
          <button className="btn btn--primary" onClick={handleNext2}>Continue →</button>
        </div>
      </div>

      {/* STEP 3 */}
      <div className={`step-panel ${step === 3 ? 'active' : ''}`}>
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label">Stage</label>
          <div className="stage-grid" role="group">
            {['Idea', 'Pre-seed', 'Seed', 'Series A'].map(s => (
              <button key={s} className={`stage-opt ${stage === s ? 'sel' : ''}`} onClick={() => setStage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label className="form-label">Industry</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }} role="group">
            {['AI/ML', 'FinTech', 'HealthTech', 'SaaS', 'CleanTech', 'EdTech', 'Consumer', 'Marketplace', 'Other'].map(ind => (
              <button key={ind} className={`chip ${industry === ind ? 'active' : ''}`} onClick={() => setIndustry(ind)} style={{ width: '100%', justifyContent: 'center' }}>
                {ind}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label className="form-label">One-line bio <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input
            className="form-input" type="text" maxLength={120}
            placeholder="Ex-Stripe. Building the future of SMB lending."
            value={bio} onChange={e => setBio(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button className="btn btn--ghost" onClick={() => setStep(2)}>← Back</button>
          <button className="btn btn--primary" onClick={handleNext3}>Review →</button>
        </div>
      </div>

      {/* STEP 4 */}
      <div className={`step-panel ${step === 4 ? 'active' : ''}`}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>This is what your pitch card will look like in the feed.</p>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div className="avatar" style={{ background: '#e63312' }} aria-hidden="true">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.83rem', fontWeight: 600 }}>{user?.user_metadata?.full_name || 'You'}</div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '2px', flexWrap: 'wrap' }}>
                  <span className="tag" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{industry || '—'}</span>
                  <span className="tag tag-dot" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>·</span>
                  <span className="tag" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{stage || '—'}</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <div className="pitch-problem-label">Problem</div>
            <p className="pitch-problem" style={{ color: problem ? '' : 'var(--text-muted)', fontStyle: problem ? 'normal' : 'italic' }}>
              {problem || 'Your problem statement will appear here.'}
            </p>
          </div>
          <div>
            <div className="pitch-solution-label">Solution</div>
            <p className="pitch-solution" style={{ color: solution ? '' : 'var(--text-muted)', fontStyle: solution ? 'normal' : 'italic' }}>
              {solution || 'Your solution will appear here.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '24px' }}>
          <button className="btn btn--ghost" onClick={() => setStep(3)} disabled={isSubmitting}>← Back</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Go live →'}
          </button>
        </div>
      </div>

    </div>
  )
}
