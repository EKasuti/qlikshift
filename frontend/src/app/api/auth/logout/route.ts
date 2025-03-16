import { createClient } from '@supabase/supabase-js'
import { NextResponse } from "next/server"

export async function POST() {
    try {
        // Initialize Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Sign out the user
        const { error } = await supabase.auth.signOut()

        if (error) { throw error }

        const response = NextResponse.json(
            { message: 'Logged out successfully' },
            { status: 200 }
        );

        // Remove access token cookie
        response.cookies.set({
            name: 'access_token',
            value: '',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 0, // maxAge set to 0 to delete the cookie
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Error in logout:', error)
        return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
    }
}
