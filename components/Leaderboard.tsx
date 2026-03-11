'use client'

import Link from 'next/link'
import { Pitch } from '@/types'

interface LeaderboardProps {
    pitches: Pitch[]
}

export default function Leaderboard({ pitches }: LeaderboardProps) {
    const topPitches = [...pitches]
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .slice(0, 5)

    if (topPitches.length === 0) return null

    return (
        <div className="leaderboard-card">
            <div className="leaderboard-header">
                <div className="leaderboard-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--yellow)' }}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                    Leaderboard
                </div>
                <span className="leaderboard-subtitle">Top Ranked</span>
            </div>

            <div className="leaderboard-list">
                {topPitches.map((pitch, index) => (
                    <div key={pitch.id} className="leaderboard-item">
                        <div className="leaderboard-rank">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                        <div className="leaderboard-info">
                            <div className="leaderboard-name">{pitch.profiles?.name || 'Anonymous'}</div>
                            <div className="leaderboard-problem truncate">{pitch.problem}</div>
                        </div>
                        <div className="leaderboard-votes">
                            <span className="vote-num">{pitch.upvotes}</span>
                            <span className="vote-label">pts</span>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .leaderboard-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }

        .leaderboard-header {
          padding: 16px;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-soft);
        }

        .leaderboard-title {
          font-weight: 800;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-main);
        }

        .leaderboard-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
        }

        .leaderboard-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-light);
          transition: background 0.2s ease;
        }

        .leaderboard-item:last-child {
          border-bottom: none;
        }

        .leaderboard-item:hover {
          background: var(--bg-hover);
        }

        .leaderboard-rank {
          width: 24px;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
          text-align: center;
          font-family: var(--font-mono);
        }

        .leaderboard-info {
          flex: 1;
          min-width: 0;
        }

        .leaderboard-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 2px;
        }

        .leaderboard-problem {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.2;
        }

        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .leaderboard-votes {
          text-align: right;
          background: var(--bg-soft);
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
        }

        .vote-num {
          display: block;
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--red);
          line-height: 1;
        }

        .vote-label {
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.02em;
        }
      `}</style>
        </div>
    )
}
