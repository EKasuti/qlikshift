import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Function to retrieve term assignments
export async function GET(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const term = searchParams.get('term_or_break');
        const desk = searchParams.get('desk');

        let query = supabaseAdmin
            .from('student_assignments')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters if provided
        if (year) {
            query = query.eq('year', year);
        }
        if (term) {
            query = query.eq('term_or_break', term);
        }
        if (desk) {
            query = query.ilike('desk_name', `%${desk}%`);
        }

        const { data: desks } = await query;

        return NextResponse.json(desks || [], { status: 200 });

    } catch {
        return NextResponse.json({ error: 'Failed to fetch interim assignments' }, { status: 500 });
    }
}