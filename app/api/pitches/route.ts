import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const body = await request.json()
    const { problem, solution, video_url, thumbnail_url, industry, stage } = body

    if (!problem || !solution || !video_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pitches')
      .insert({
        user_id: userId,
        problem,
        solution,
        video_url,
        thumbnail_url,
        industry,
        stage
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Pitch submitted successfully', pitch: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
