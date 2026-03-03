import { createClient } from '@/utils/supabase/server'
import PitchCard from '@/components/PitchCard'
import type { Pitch } from '@/types'
import ProfileActions from '@/components/ProfileActions'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  // Fetch their pitches
  const { data: pitches } = await supabase
    .from('pitches')
    .select(`
      *,
      profiles(name, avatar_url, bio),
      votes(count),
      comments(count)
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const formattedPitches = (pitches || []).map((p: any) => ({
    ...p,
    upvotes: p.votes?.[0]?.count || 0,
    comments: p.comments?.[0]?.count || 0,
    has_voted: false
  })) as Pitch[]

  // Check if this is the current logged-in user viewing their own profile
  const isOwner = user?.id === id

  const initial = profile?.name?.charAt(0) || 'F'

  return (
    <div className="container container--sm" style={{ padding: '48px 24px', maxWidth: '640px' }}>
      <header className="profile-header">
        <div className="profile-header__top">
          <div className="avatar avatar--xl" style={{ background: 'var(--text-primary)' }} aria-hidden="true">
            {initial}
          </div>
          <div className="profile-header__actions">
            {isOwner ? (
              <ProfileActions profile={profile} />
            ) : (
              <button className="btn btn--secondary btn--sm">Share</button>
            )}
          </div>
        </div>
        <h1 className="profile-name">{profile?.name || 'Anonymous Founder'}</h1>
        {profile?.location && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {profile.location}
          </div>
        )}
        <p className="profile-bio">{profile?.bio || 'Building something new.'}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          {profile?.startup_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Startup:</span>
              {profile.startup_name}
              {profile.startup_website && (
                <a href={profile.startup_website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', fontSize: '0.75rem', marginLeft: '4px' }}>
                  Visit ↗
                </a>
              )}
            </div>
          )}

          {profile?.founder_linkedin && (
            <a href={profile.founder_linkedin} target="_blank" rel="noopener noreferrer" className="chip chip--ghost" style={{ width: 'fit-content', fontSize: '0.7rem', padding: '4px 10px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              LinkedIn Profile
            </a>
          )}
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="profile-stat-val">{formattedPitches.length}</div>
            <div className="profile-stat-label">Pitches</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-val">
              {formattedPitches.reduce((acc, p) => acc + p.upvotes, 0).toLocaleString()}
            </div>
            <div className="profile-stat-label">Total Upvotes</div>
          </div>
        </div>
      </header>

      <div className="profile-tabs" role="tablist">
        <button className="profile-tab active" role="tab" aria-selected="true">Pitches</button>
        <button className="profile-tab" role="tab" aria-selected="false">Updates</button>
      </div>

      <div className="pitch-list" role="feed">
        {formattedPitches.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No pitches live yet.
          </div>
        ) : (
          formattedPitches.map((pitch, idx) => (
            <PitchCard key={pitch.id} pitch={pitch} index={idx} currentUser={user?.id} />
          ))
        )}
      </div>
    </div>
  )
}
