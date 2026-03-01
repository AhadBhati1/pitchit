'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Profile {
    id: string
    name: string | null
    bio: string | null
    location: string | null
    avatar_url: string | null
}

export default function ProfileActions({ profile }: { profile: Profile }) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)

    // Edit form state
    const [name, setName] = useState(profile.name || '')
    const [bio, setBio] = useState(profile.bio || '')
    const [location, setLocation] = useState(profile.location || '')

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, bio, location })
            })
            if (!res.ok) throw new Error('Update failed')
            setIsEditing(false)
            router.refresh()
        } catch (err) {
            alert('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!confirm('Are you absolutely sure? This will delete your account and all your pitches permanently. This action cannot be undone.')) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/user', {
                method: 'DELETE'
            })
            if (!res.ok) throw new Error('Deletion failed')

            // Clear local storage/session if any and redirect
            router.push('/')
            router.refresh()
        } catch (err) {
            alert('Failed to delete account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <div className="edit-modal-overlay">
                <div className="edit-modal">
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Edit Profile</h2>
                    <form onSubmit={handleUpdate}>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label">Name</label>
                            <input
                                className="form-input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label className="form-label">Bio</label>
                            <textarea
                                className="form-textarea"
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="What are you building?"
                                rows={3}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label className="form-label">Location</label>
                            <input
                                className="form-input"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="San Francisco, CA"
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn btn--primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="btn btn--ghost" onClick={() => setIsEditing(false)} disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--red)', fontWeight: 700, marginBottom: '8px' }}>Danger Zone</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="btn btn--secondary btn--sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={handleDeleteAccount} disabled={loading}>
                            Delete Account
                        </button>
                    </div>
                </div>

                <style jsx>{`
          .edit-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }
          .edit-modal {
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: var(--r-lg);
            width: 100%;
            max-width: 440px;
            padding: 32px;
          }
        `}</style>
            </div>
        )
    }

    return (
        <>
            <button className="btn btn--ghost btn--sm" onClick={() => setIsEditing(true)}>Edit Profile</button>
            <button className="btn btn--secondary btn--sm" onClick={() => {
                const url = window.location.href
                navigator.clipboard.writeText(url)
                alert('Profile link copied!')
            }}>Share</button>
        </>
    )
}
