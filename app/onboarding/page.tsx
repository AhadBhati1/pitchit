'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        startup_name: '',
        startup_website: '',
        founder_linkedin: ''
    })

    const supabase = createClient()

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            // Fetch existing profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profile) {
                if (profile.onboarding_completed) {
                    router.push('/submit')
                    return
                }
                setFormData({
                    name: profile.name || '',
                    bio: profile.bio || '',
                    startup_name: profile.startup_name || '',
                    startup_website: profile.startup_website || '',
                    founder_linkedin: profile.founder_linkedin || ''
                })
            }
            setLoading(false)
        }
        checkUser()
    }, [router, supabase])

    const handleSave = async () => {
        setSaving(true)
        const { error } = await supabase
            .from('profiles')
            .update({
                ...formData,
                onboarding_completed: true
            })
            .eq('id', user.id)

        if (error) {
            alert('Error saving profile: ' + error.message)
            setSaving(false)
        } else {
            router.push('/submit')
        }
    }

    if (loading) return <div className="loading-screen">Preparing your onboarding...</div>

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <header className="onboarding-header">
                    <div className="step-indicator">Step {step} of 2</div>
                    <h1>{step === 1 ? "Tell us about yourself" : "Tell us about your startup"}</h1>
                    <p>{step === 1 ? "Let's personalize your founder profile." : "Help investors and operators understand what you're building."}</p>
                </header>

                <div className="onboarding-body">
                    {step === 1 ? (
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="How should people address you?"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <label style={{ marginTop: '20px' }}>Short Bio</label>
                            <textarea
                                placeholder="Founder at X, previously Y..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />

                            <label style={{ marginTop: '20px' }}>LinkedIn Profile (Optional)</label>
                            <input
                                type="url"
                                placeholder="https://linkedin.com/in/yourname"
                                value={formData.founder_linkedin}
                                onChange={(e) => setFormData({ ...formData, founder_linkedin: e.target.value })}
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Startup Name</label>
                            <input
                                type="text"
                                placeholder="What is the name of your venture?"
                                value={formData.startup_name}
                                onChange={(e) => setFormData({ ...formData, startup_name: e.target.value })}
                            />

                            <label style={{ marginTop: '20px' }}>Website (Optional)</label>
                            <input
                                type="url"
                                placeholder="https://yourstartup.com"
                                value={formData.startup_website}
                                onChange={(e) => setFormData({ ...formData, startup_website: e.target.value })}
                            />

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                                You're almost there! Once you finish, you can record your first 60-second pitch.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="onboarding-footer">
                    {step === 2 && (
                        <button className="btn btn--ghost" onClick={() => setStep(1)} style={{ marginRight: 'auto' }}>Back</button>
                    )}

                    {step === 1 ? (
                        <button
                            className="btn btn--primary"
                            onClick={() => setStep(2)}
                            disabled={!formData.name}
                            style={{ marginLeft: 'auto' }}
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            className="btn btn--primary"
                            onClick={handleSave}
                            disabled={saving || !formData.startup_name}
                            style={{ marginLeft: 'auto' }}
                        >
                            {saving ? "Creating Profile..." : "Finish & Start Pitching"}
                        </button>
                    )}
                </footer>
            </div>

            <style jsx>{`
        .onboarding-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 24px;
        }
        .onboarding-card {
          background: white;
          width: 100%;
          max-width: 480px;
          border-radius: var(--r-xl);
          border: 1px solid var(--border);
          box-shadow: 0 20px 60px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .onboarding-header {
          padding: 40px 40px 20px;
          text-align: center;
        }
        .step-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--red);
          margin-bottom: 12px;
        }
        .onboarding-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .onboarding-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .onboarding-body {
          padding: 20px 40px 40px;
        }
        .form-group label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--r-md);
          border: 1px solid var(--border);
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--text-primary);
          outline: none;
        }
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        .onboarding-footer {
          padding: 24px 40px;
          background: var(--bg);
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
        }
        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-weight: 500;
        }
      `}</style>
        </div>
    )
}
