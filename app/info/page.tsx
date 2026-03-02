'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const SECTIONS = [
    { id: 'about', label: 'About' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'terms', label: 'Terms' },
]

function InfoContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const currentTab = searchParams.get('tab') || 'about'

    const activeSection = SECTIONS.find(s => s.id === currentTab) || SECTIONS[0]

    return (
        <div className="container container--sm" style={{ padding: '80px 24px', maxWidth: '800px' }}>
            <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '16px' }}>
                    Groundfloor Info
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Everything you need to know about the platform.
                </p>
            </header>

            <div className="info-tabs" style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '40px', overflowX: 'auto', paddingBottom: '1px' }}>
                {SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => router.push(`/info?tab=${section.id}`)}
                        style={{
                            padding: '12px 4px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: currentTab === section.id ? 'var(--text-primary)' : 'var(--text-muted)',
                            borderBottom: `2px solid ${currentTab === section.id ? 'var(--text-primary)' : 'transparent'}`,
                            background: 'none',
                            borderTop: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {section.label}
                    </button>
                ))}
            </div>

            <div style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                {currentTab === 'about' && (
                    <section>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>What is Groundfloor?</h2>
                        <p>
                            Groundfloor is where startup ideas get their first real shot. We believe that the best ideas don't always come from people with the best connections or the shinest slide decks.
                        </p>
                        <p style={{ marginTop: '16px' }}>
                            We've built a frictionless, reel-style feed where founders can pitch their vision in under 60 seconds. No gatekeeping, no long forms—just you and your idea.
                        </p>
                    </section>
                )}

                {currentTab === 'how-it-works' && (
                    <section>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>How it Works</h2>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>1. Record & Upload</h3>
                                <p>Use your phone or webcam to record a 60-second pitch. Focus on the problem you're solving and why it matters.</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>2. Get Scored</h3>
                                <p>Our community (and a little bit of AI) scores your pitch based on clarity, market need, and founder-market fit.</p>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>3. Connect</h3>
                                <p>Top pitches get seen by operators, early-stage investors, and potential co-founders who are looking for the next big thing.</p>
                            </div>
                        </div>
                    </section>
                )}

                {currentTab === 'privacy' && (
                    <section>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Privacy Policy</h2>
                        <p>Last updated: March 3, 2026</p>
                        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>1. Information We Collect</h3>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, upload a pitch, or communicate with us. This includes your name, email, and any media files you upload.
                        </p>
                        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>2. How We Use Your Information</h3>
                        <p>
                            We use your information to provide, maintain, and improve our services, including to display your pitches to other users and to process your interactions (votes, comments).
                        </p>
                        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>3. Data Sharing</h3>
                        <p>
                            Your pitches and profile information are public by design. We do not sell your personal data to third parties.
                        </p>
                    </section>
                )}

                {currentTab === 'terms' && (
                    <section>
                        <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Terms of Service</h2>
                        <p>Last updated: March 3, 2026</p>
                        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using Groundfloor, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service.
                        </p>
                        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>2. Content Ownership</h3>
                        <p>
                            You retain all rights to the pitches and content you upload. By uploading, you grant Groundfloor a non-exclusive license to display and distribute your content onto the platform.
                        </p>
                        <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>3. Conduct</h3>
                        <p>
                            You agree not to upload content that is illegal, harmful, or violates the intellectual property rights of others. We reserve the right to remove any content at our discretion.
                        </p>
                    </section>
                )}
            </div>

            <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '32px', textAlign: 'center' }}>
                <button onClick={() => router.push('/')} className="btn btn--ghost">Back to Pitches</button>
            </div>
        </div>
    )
}

export default function InfoPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InfoContent />
        </Suspense>
    )
}
