import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization')
        
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        
        // Initialize regular Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Retrieve user using the token
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (error || !user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.user_metadata?.username || null,
                created_at: user.created_at,
                role: user.role,
                email_confirmed_at: user.email_confirmed_at,
                last_sign_in_at: user.last_sign_in_at,
            },
        }, { status: 200 })

    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}