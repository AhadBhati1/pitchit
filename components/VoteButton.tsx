'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VoteButton({
  pitchId,
  initialVotes,
  initialHasVoted,
  isLoggedIn
}: {
  pitchId: string
  initialVotes: number
  initialHasVoted: boolean
  isLoggedIn: boolean
}) {
  const router = useRouter()
  const [votes, setVotes] = useState(initialVotes)
  const [hasVoted, setHasVoted] = useState(initialHasVoted)
  const [loading, setLoading] = useState(false)

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    if (loading) return

    // Optimistic UI update
    setHasVoted(!hasVoted)
    setVotes(prev => hasVoted ? prev - 1 : prev + 1)
    setLoading(true)

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch_id: pitchId, type: 'up' })
      })

      if (!res.ok) {
        throw new Error('Vote failed')
      }
      
      router.refresh()
    } catch (error) {
      // Revert optimistic update on failure
      setHasVoted(hasVoted)
      setVotes(initialVotes)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      className={`act-btn ${hasVoted ? 'upvoted' : ''}`} 
      onClick={handleVote}
      aria-label={hasVoted ? 'Remove upvote' : 'Upvote'} 
      aria-pressed={hasVoted}
    >
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
        <path 
          d="M5.5 1L10 5H7.5v5h-4V5H1L5.5 1z" 
          fill={hasVoted ? 'var(--red)' : 'none'} 
          stroke={hasVoted ? 'var(--red)' : 'currentColor'} 
          strokeWidth="1.2" 
          strokeLinejoin="round"
        />
      </svg>
      <span>{votes.toLocaleString()}</span>
    </button>
  )
}
