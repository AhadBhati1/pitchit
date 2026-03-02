'use client'

import { useEffect, useState } from 'react'

export default function DiagnosticsPage() {
    const [env, setEnv] = useState<any>(null)

    useEffect(() => {
        setEnv({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Missing ❌',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Missing ❌',
            NODE_ENV: process.env.NODE_ENV,
            origin: window.location.origin,
            is_india_proxy_target: window.location.origin + '/api/supabase'
        })
    }, [])

    if (!env) return <div>Loading diagnostics...</div>

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', lineHeight: '2' }}>
            <h1>Groundfloor Diagnostics</h1>
            <hr />
            <p><b>Required Environment Variables (in Vercel):</b></p>
            <ul>
                <li>URL: {env.NEXT_PUBLIC_SUPABASE_URL}</li>
                <li>Anon Key: {env.NEXT_PUBLIC_SUPABASE_ANON_KEY}</li>
            </ul>
            <p><b>Current Mode:</b> {env.NODE_ENV}</p>
            <p><b>India Proxy URL:</b> {env.is_india_proxy_target}</p>
            <hr />
            <p style={{ color: 'var(--text-muted)' }}>If the variables above say "Missing", you must add them to your Vercel Project Settings &gt; Environment Variables.</p>
        </div>
    )
}
