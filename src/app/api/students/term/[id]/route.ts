import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { id } = await params;

        // Fetch the student by ID
        const { data: student, error } = await supabaseAdmin
            .from('students')
            .select('*, availability_slots(*)')
            .eq('id', id)
            .single(); // Gets a single student

        if (error || !student) {
            return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(student), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}
