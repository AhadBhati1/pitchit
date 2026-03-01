import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    const { pitch_id, type } = await request.json()

    // Check if vote exists
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('pitch_id', pitch_id)
      .eq('user_id', userId)
      .single()

    if (existingVote) {
      // Toggle off (delete vote)
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)

      if (error) throw error
      return NextResponse.json({ message: 'Vote removed' })
    } else {
      // Toggle on (insert vote)
      const { error } = await supabase
        .from('votes')
        .insert({
          pitch_id,
          user_id: userId,
          type
        })

      if (error) throw error
      return NextResponse.json({ message: 'Vote added' })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
