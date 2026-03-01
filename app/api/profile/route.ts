import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, bio, location } = await request.json()

        const { data, error } = await supabase
            .from('profiles')
            .update({
                name,
                bio,
                location,
            })
            .eq('id', user.id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ message: 'Profile updated successfully', profile: data })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
