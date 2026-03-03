import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const pitchId = searchParams.get('pitchId')

    if (!pitchId) {
        return NextResponse.json({ error: 'pitchId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('comments')
        .select(`
      *,
      profiles!user_id(name, avatar_url)
    `)
        .eq('pitch_id', pitchId)
        .order('created_at', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pitchId, text, role } = body

    if (!pitchId || !text) {
        return NextResponse.json({ error: 'pitchId and text are required' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('comments')
        .insert({
            pitch_id: pitchId,
            user_id: user.id,
            text: text,
            role: role || 'Viewer'
        })
        .select(`
      *,
      profiles!user_id(name, avatar_url)
    `)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
