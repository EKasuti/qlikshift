import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { id } = await params; 

        // Fetch the students by month
        const { data: students, error } = await supabaseAdmin
            .from('interim_students')
            .select('*, interim_availability_slots(*)')
            .eq('id', id)
            .single(); 
        if (error || !students) {
            return new Response(JSON.stringify({ error: 'No students found for the specified month' }), { status: 404 });
        }

        return new Response(JSON.stringify(students), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
    }
}
