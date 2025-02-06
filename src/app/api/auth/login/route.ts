import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status || 400 } 
            );
        }

        const response = NextResponse.json(
        { user: {
            id: data.user?.id,
            email: data.user?.email,
            role: data.user?.role
        },
            
        access_token: data.session?.access_token}, { status: 200 });

        if (data.session) {
            response.cookies.set({
                name: 'access_token',
                value: data.session.access_token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: data.session.expires_in,
                path: '/',
            });

            response.cookies.set({
                name: 'refresh_token',
                value: data.session.refresh_token,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/',
            });
        }

        return response;
    } catch (err) {
        return NextResponse.json(
            { error: 'Internal server error', details: err instanceof Error ? err.message : String(err) }, { status: 500 }
        );
    }
}
