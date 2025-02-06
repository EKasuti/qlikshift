import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const shiftId = url.searchParams.get('shiftId');

    try {
        // Step 1: Get the shift details for the given shift ID
        const { data: shiftDetails, error: shiftError } = await supabaseAdmin!
            .from('interim_shifts') 
            .select(`*, interim_slots:interim_slots (*)`) 
            .eq('id', shiftId) 
            .single(); 

        if (shiftError || !shiftDetails) {
            return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
        }

        const { date } = shiftDetails.interim_slots;
        const { start_time, end_time } = shiftDetails;
        const time_slot = `${start_time} - ${end_time}`;

        // Step 2: Get students' availability for the specified date and time slot
        const { data: availabilitySlots, error: availabilityError } = await supabaseAdmin!
            .from('interim_availability_slots')
            .select('student_id, availability_status')
            .eq('date', date)
            .eq('time_slot', time_slot); 

        if (availabilityError) {throw new Error('Error fetching availability slots');}

        // Step 3: Get student details for available slots
        const studentIds = availabilitySlots.map(slot => slot.student_id);
        const { data: students, error: studentError } = await supabaseAdmin!
            .from('interim_students')
            .select('id, preferred_name, email')
            .in('id', studentIds);

        if (studentError) { throw new Error('Error fetching student details'); }

        // Combine availability with student details
        const availableFirstChoice = availabilitySlots
            .filter(slot => slot.availability_status === '1st Choice')
            .map(slot => {
            const student = students.find(s => s.id === slot.student_id);
            return {
                student_id: slot.student_id,
                preferred_name: student?.preferred_name,
                email: student?.email,
                availability_status: slot.availability_status,
            };
            });

        const availableSecondChoice = availabilitySlots
            .filter(slot => slot.availability_status === '2nd Choice')
            .map(slot => {
            const student = students.find(s => s.id === slot.student_id);
            return {
                student_id: slot.student_id,
                preferred_name: student?.preferred_name,
                email: student?.email,
                availability_status: slot.availability_status,
            };
        });

        return NextResponse.json({ firstChoice: availableFirstChoice, secondChoice: availableSecondChoice }, { status: 200 });
    } catch {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
  