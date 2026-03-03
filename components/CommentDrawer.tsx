'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Pitch } from '@/types'

interface Comment {
  id: string
  text: string
  role: string
  created_at: string
  profiles: {
    name: string
    avatar_url: string | null
  }
}

interface CommentDrawerProps {
  pitchId: string
  isOpen: boolean
  onClose: () => void
  user: any
}

export default function CommentDrawer({ pitchId, isOpen, onClose, user }: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [role, setRole] = useState('Viewer')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, pitchId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?pitchId=${pitchId}`)
      const data = await res.json()
      if (res.ok && Array.isArray(data)) {
        setComments(data)
      } else {
        console.error('Fetch comments error:', data)
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !user || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId, text: newComment, role })
      })
      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || data.details || 'Unknown error'
        alert(`Backend Error: ${errorMsg}`)
        console.error('Comment post error:', data)
        setSubmitting(false)
        return
      }

      if (data && data.id) {
        setComments([...comments, data])
        setNewComment('')
        // Scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        }, 100)
      }
    } catch (err: any) {
      console.error('Failed to post comment:', err)
      alert(`Critical Error: ${err.message || 'Check connection'}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="comment-drawer-overlay" onClick={onClose}>
      <div className="comment-drawer" onClick={e => e.stopPropagation()}>
        <header className="comment-drawer-header">
          <div className="drawer-handle" onClick={onClose}></div>
          <h3>Comments</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="comment-list" ref={scrollRef}>
          {loading ? (
            <div className="loading-state">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="empty-state">No comments yet. Be the first to shout out!</div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="avatar avatar--sm" style={{ background: 'var(--text-primary)', color: 'white' }}>
                  {comment.profiles?.name?.[0] || 'A'}
                </div>
                <div className="comment-content">
                  <div className="comment-meta">
                    <span className="comment-author">{comment.profiles?.name || 'Anonymous'}</span>
                    <span className="comment-role">{comment.role}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {user ? (
          <form className="comment-input-area" onSubmit={handleSubmit}>
            <div className="role-selector">
              {['Operator', 'Investor', 'Customer', 'Viewer'].map(r => (
                <button
                  key={r}
                  type="button"
                  className={`role-chip ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="input-row">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? '...' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Sign in to join the conversation</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .comment-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 3000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .comment-drawer {
          width: 100%;
          max-width: 500px;
          background: white;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          height: 70vh;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .comment-drawer-header {
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          text-align: center;
          position: relative;
        }
        .drawer-handle {
          width: 40px;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          margin: 0 auto 10px;
          cursor: pointer;
        }
        .comment-drawer-header h3 {
          font-size: 0.9rem;
          font-weight: 800;
          margin: 0;
        }
        .close-btn {
          position: absolute;
          right: 15px;
          top: 15px;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-muted);
        }
        .comment-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .comment-item {
          display: flex;
          gap: 12px;
        }
        .comment-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .comment-author {
          font-size: 0.8rem;
          font-weight: 700;
        }
        .comment-role {
          font-size: 0.65rem;
          background: var(--bg);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .comment-text {
          font-size: 0.85rem;
          color: var(--text-primary);
          line-height: 1.4;
        }
        .comment-input-area {
          padding: 15px 20px 30px;
          border-top: 1px solid var(--border);
          background: white;
        }
        .role-selector {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .role-chip {
          padding: 4px 10px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: none;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }
        .role-chip.active {
          background: var(--text-primary);
          color: white;
          border-color: var(--text-primary);
        }
        .input-row {
          display: flex;
          gap: 10px;
        }
        .input-row input {
          flex: 1;
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 8px 16px;
          font-size: 0.9rem;
          background: var(--bg);
        }
        .send-btn {
          background: var(--red);
          color: white;
          border: none;
          border-radius: 100px;
          padding: 0 16px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .send-btn:disabled {
          opacity: 0.5;
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .login-prompt {
          padding: 20px;
          text-align: center;
          border-top: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
