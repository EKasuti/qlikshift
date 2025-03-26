import { setCorsHeaders } from '@/lib/cors';
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const origin = request.headers.get('origin');
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { id } = await params;

        // Fetch the student by ID
        const { data: student, error } = await supabaseAdmin
            .from('term_students')
            .select('*, term_student_availability_slots(*)')
            .eq('id', id)
            .single();

        if (error || !student) {
            return setCorsHeaders(new NextResponse(JSON.stringify({ error: 'Student not found' }), { status: 404 }), origin);
        }

        return setCorsHeaders(new NextResponse(JSON.stringify(student), { status: 200 }), origin);
    } catch (error) {
        return setCorsHeaders(new NextResponse(JSON.stringify({ error: (error as Error).message }), { status: 500 }), origin);
    }
}
