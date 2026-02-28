'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import PitchCard from '@/components/PitchCard'
import Link from 'next/link'
import VoteButton from '@/components/VoteButton'

export interface Pitch {
  id: string
  created_at: string
  problem: string
  solution: string
  video_url: string
  industry: string
  stage: string
  user_id: string
  upvotes: number
  comments: number
  has_voted: boolean
  profiles: {
    name: string
    avatar_url: string | null
    bio: string | null
  }
}

export default function Home() {
  const [viewMode, setViewMode] = useState<'classic' | 'elevator'>('classic')
  const [pitches, setPitches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data, error } = await supabase
        .from('pitches')
        .select(`
          *,
          profiles(name, avatar_url, bio),
          votes(count),
          comments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Elevator fetch error:', error)
      }

      if (data) {
        const formatted = data.map(p => ({
          ...p,
          profiles: p.profiles || { name: 'Anonymous Founder', avatar_url: null, bio: null },
          upvotes: (p.votes as any)?.[0]?.count || 0,
          comments: (p.comments as any)?.[0]?.count || 0,
          has_voted: false
        }))
        setPitches(formatted)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading feed...</div>
  }

  if (viewMode === 'elevator') {
    return (
      <div className="elevator-container">
        {/* Elevator Navigation Overlay */}
        <div className="elevator-nav-overlay">
          <button className="chip active" onClick={() => setViewMode('elevator')}>Elevator View</button>
          <button className="chip chip--ghost" onClick={() => setViewMode('classic')}>Classic</button>
        </div>

        {pitches.length === 0 ? (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: '#000', flexDirection: 'column', gap: '20px' }}>
            <p>No pitches live yet.</p>
            <button className="btn btn--primary" onClick={() => setViewMode('classic')}>Back to Classic</button>
          </div>
        ) : (
          pitches.map((pitch) => (
            <div key={pitch.id} className="elevator-item">
              <div className="elevator-video-container">
                <video
                  src={pitch.video_url}
                  className="elevator-video"
                  autoPlay
                  muted
                  loop
                  playsInline
                />

                <div className="elevator-overlay">
                  <div className="elevator-info">
                    <div className="elevator-founder">
                      <div className="avatar avatar--sm" style={{ background: 'var(--red)' }}>
                        {(pitch.profiles?.name || 'A')[0]}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{pitch.profiles?.name || 'Anonymous'}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>{pitch.problem}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9 }}>{pitch.solution}</p>
                  </div>
                </div>

                <div className="elevator-actions">
                  <div className="elevator-action-btn">
                    <VoteButton
                      pitchId={pitch.id}
                      initialVotes={pitch.upvotes}
                      initialHasVoted={false}
                      isLoggedIn={!!user}
                    />
                  </div>
                  <div className="elevator-action-btn">
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    </div>
                    <span>{pitch.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__label">
          <span className="live-dot" aria-hidden="true"></span>
          Open to every founder
        </div>
        <h1 className="hero__title" id="hero-title">
          Where startup ideas get<br />their <em>first real shot.</em>
        </h1>
        <p className="hero__sub">
          Pitch your idea in 60 seconds. Get scored and reviewed by operators, investors, and customers — no deck, no gatekeeping.
        </p>
        <div className="hero__ctas">
          <Link href="/submit" className="btn btn--primary">Submit your pitch — it&apos;s free</Link>
          <button className="btn btn--ghost" onClick={() => setViewMode('elevator')}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ marginRight: '6px' }}><path d="M3 2l8 4-8 4V2z" fill="currentColor" /></svg>
            Watch Pitches
          </button>
        </div>
      </section>

      <div className="container">
        <div className="feed-layout">
          <div className="feed-main">
            <div className="feed-tabs" role="tablist">
              <button className="feed-tab active" role="tab" aria-selected="true">
                Latest <span className="tab-count">{pitches.length}</span>
              </button>
              <button className="feed-tab" onClick={() => setViewMode('elevator')}>
                Elevator View
              </button>
            </div>

            <div className="pitch-list" role="feed">
              {pitches.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No pitches live yet. Be the first.
                </div>
              ) : (
                pitches.map((pitch, idx) => (
                  <PitchCard key={pitch.id} pitch={pitch} index={idx} currentUser={user?.id} />
                ))
              )}
            </div>
          </div>

          <aside className="feed-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">About Groundfloor</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '12px' }}>
                A living feed of 60-second pitches. No deck, no connections, no gatekeeping. Just a founder with an idea.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .elevator-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2000;
        }
      `}</style>
    </>
  )
}
