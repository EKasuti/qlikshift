import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { id } = params;

        // Fetch the student by ID
        const { data: student, error } = await supabaseAdmin
            .from('interim_students')
            .select('*, interim_availability_slots(*)')
            .eq('id', id)
            .single(); // Get a single student

        if (error || !student) {
            return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(student), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}
