'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Pitch } from '@/types'
import VoteButton from './VoteButton'

export default function PitchCard({
  pitch,
  index,
  currentUser
}: {
  pitch: Pitch
  index: number
  currentUser?: string
}) {
  const router = useRouter()
  const age = Math.round((Date.now() - new Date(pitch.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const ageStr = age === 0 ? 'Today' : `${age}d`
  const initial = pitch.profiles?.name?.charAt(0) || 'F'

  return (
    <article className="pitch-card" tabIndex={0} role="button">
      <div className="pitch-card__num">{String(index + 1).padStart(2, '0')}</div>
      <div className="pitch-card__body">
        <div className="pitch-card__top">
          <div className="founder-row">
            <div className="avatar" style={{ background: 'var(--text-primary)' }} aria-hidden="true">
              {initial}
            </div>
            <div className="founder-meta">
              <div className="founder-name">{pitch.profiles?.name || 'Anonymous Founder'}</div>
              <div className="founder-tags">
                <span className="tag">{pitch.industry}</span>
                <span className="tag-dot tag">·</span>
                <span className="tag">{pitch.stage}</span>
                <span className="tag-dot tag">·</span>
                <span className="tag">{ageStr}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <div className="pitch-problem-label">Problem</div>
          <p className="pitch-problem">{pitch.problem}</p>
        </div>
        <div>
          <div className="pitch-solution-label">Solution</div>
          <p className="pitch-solution">{pitch.solution}</p>
        </div>

        {pitch.video_url && (
          <div style={{ marginTop: '16px', borderRadius: 'var(--r-md)', overflow: 'hidden', background: '#000' }}>
            <video
              src={pitch.video_url}
              poster={pitch.thumbnail_url || undefined}
              controls
              preload="none"
              style={{ width: '100%', maxHeight: '380px', display: 'block' }}
            />
          </div>
        )}

        <div className="pitch-actions">
          <VoteButton
            pitchId={pitch.id}
            initialVotes={pitch.upvotes}
            initialHasVoted={pitch.has_voted}
            isLoggedIn={!!currentUser}
          />
          <div className="act-sep" aria-hidden="true"></div>
          <button className="act-btn" aria-label={`${pitch.comments} comments`}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M9 1H2C1.4 1 1 1.4 1 2v6c0 .6.4 1 1 1h2l2 2 2-2h1c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
            </svg>
            {pitch.comments}
          </button>
        </div>
      </div>
    </article>
  )
}
