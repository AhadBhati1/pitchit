import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
    try {
        const supabaseServer = await createServerClient()
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Initialize admin client with service role key to delete user from auth.users
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        // Delete the user from auth.users (cascades to public.profiles and pitches due to FK)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (deleteError) {
            throw deleteError
        }

        // Sign out the user locally by clearing cookies (though session is already gone on server)
        await supabaseServer.auth.signOut()

        return NextResponse.json({ message: 'Account deleted successfully' })
    } catch (err: any) {
        console.error('Deletion error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
