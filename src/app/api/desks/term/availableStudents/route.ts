import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const shiftId = url.searchParams.get('shiftId');
    const termOrBreak = url.searchParams.get('termOrBreak');
    const desk = url.searchParams.get('desk');

    try {
        // Step 1: Get the shift details for the given shift ID
        const { data: shiftDetails, error: shiftError } = await supabaseAdmin!
            .from('term_shifts')
            .select(`*, term_slot:term_slots (*)`)
            .eq('id', shiftId)
            .single();
        
        // console.log("DEBUG: shiftDetails", shiftDetails);

        if (shiftError || !shiftDetails) {
            console.error('Shift not found or error:', shiftError);
            return NextResponse.json({ message: 'Shift not found' }, { status: 404 });
        }

        const { day_of_week } = shiftDetails.term_slot;
        const { start_time, end_time } = shiftDetails;
        const time_slot = `${start_time} - ${end_time}`;
        // console.log('Day of week:', day_of_week, 'Time slot:', time_slot);

        // Step 2: Get students' availability for the specified day and time slot
        const { data: availabilitySlots, error: availabilityError } = await supabaseAdmin!
            .from('term_student_availability_slots')
            .select('term_student_id, availability_status')
            .eq('day_of_week', day_of_week)
            .eq('time_slot', time_slot);
        // console.log('Availability slots:', availabilitySlots);

        if (availabilityError) {
            console.error('Error fetching availability slots:', availabilityError);
            throw new Error('Error fetching availability slots');
        }

        // Step 3: Get ALL student details for available slots WITHOUT filtering by desk and term first
        // This ensures we have complete student data for mapping
        const studentIds = [...new Set(availabilitySlots.map(slot => slot.term_student_id))];
        // console.log('Student IDs:', studentIds);

        const { data: allStudents, error: studentError } = await supabaseAdmin!
            .from('term_students')
            .select('id, preferred_name, email, jobs, term_or_break')
            .in('id', studentIds);

        if (studentError) {
            console.error('Error fetching student details:', studentError);
            throw new Error('Error fetching student details');
        }

        // Filter students by termOrBreak and desk after fetching
        const students = allStudents.filter(student => 
            student.term_or_break === termOrBreak && 
            student.jobs && 
            student.jobs.toLowerCase().includes(desk!.toLowerCase())
        );
        // console.log('Filtered student details:', students);

        // Combine availability with student details
        const availableFirstChoice = availabilitySlots
            .filter(slot => slot.availability_status === '1st Choice')
            .map(slot => {
                const student = students.find(s => s.id === slot.term_student_id);
                // Only include students that match our criteria
                if (!student) return null;
                
                return {
                    student_id: slot.term_student_id,
                    preferred_name: student.preferred_name,
                    email: student.email,
                    availability_status: slot.availability_status,
                };
            })
            .filter(item => item !== null); // Remove null items
        
        // console.log('Available first choice:', availableFirstChoice);

        const availableSecondChoice = availabilitySlots
            .filter(slot => slot.availability_status === '2nd Choice')
            .map(slot => {
                const student = students.find(s => s.id === slot.term_student_id);
                // Only include students that match our criteria
                if (!student) return null;
                
                return {
                    student_id: slot.term_student_id,
                    preferred_name: student.preferred_name,
                    email: student.email,
                    availability_status: slot.availability_status,
                };
            })
            .filter(item => item !== null); // Remove null items
        
        // console.log('Available second choice:', availableSecondChoice);

        // Remove duplicates
        const uniqueFirstChoice = availableFirstChoice.filter((student, index, self) =>
            index === self.findIndex(s => s.student_id === student.student_id)
        );
        // console.log('Unique first choice:', uniqueFirstChoice);

        const uniqueSecondChoice = availableSecondChoice.filter((student, index, self) =>
            index === self.findIndex(s => s.student_id === student.student_id)
        );
        // console.log('Unique second choice:', uniqueSecondChoice);

        return NextResponse.json({ firstChoice: uniqueFirstChoice, secondChoice: uniqueSecondChoice }, { status: 200 });
    } catch (error) {
        console.error('Internal Server Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}