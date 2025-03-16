import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Term Student availability Interface
interface TermStudentAvailability {
    id: string;
    term_student_id: string;
    day_of_week: string;
    time_slot: string;
    scheduled_status: string;
    created_at: string;
}

// Term Shift Interface
interface TermShift {
    id: string;
    max_students?: number;
    students_detailed?: string[];
    start_time?: string;
    end_time?: string;
}

// Function to check if student is eligible for desk
function isEligibleForDesk(studentJobs: string[], deskName: string): boolean {
    return studentJobs
        .map(job => job.trim().toLowerCase())
        .includes(deskName.toLowerCase());
}

// Function to check if a shift slot has space
function hasAvailableSpace(shift: TermShift, currentAssignments: string[]): boolean {
    const maxStudents = shift.max_students || 1;
    return currentAssignments.length < maxStudents;
}

// Function to check if it's consecutive
function isConsecutive(existing: TermShift, candidate: TermShift): boolean {
    return existing.end_time === candidate.start_time || candidate.end_time === existing.start_time;
}

// Function to update shift details
async function updateShiftDetails(shiftId: string, updatedStudents: string[]): Promise<boolean> {
    // console.log('DEBUG: Updated students:', updatedStudents);

    const { error } = await supabaseAdmin!
        .from('term_shifts')
        .update({ students_detailed: updatedStudents })
        .eq('id', shiftId);

    return !error;
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { desk_name, year, term_or_break, round_number, set_to_max_shifts, shifts_to_assign, consider_preferred_desk } = body;

        // console.log('DEBUG: Incoming request body:', body);

        // Validating request body
        if (
            !desk_name ||
            !year ||
            !term_or_break ||
            round_number === undefined ||
            set_to_max_shifts === undefined ||
            shifts_to_assign === undefined ||
            consider_preferred_desk === undefined
        ) {
            console.error('ERROR: Missing required fields in request body');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Initializing log summary
        const logSummary: string[] = [];
        logSummary.push(`Processing assignments for Desk: ${desk_name}, Year: ${year}, Term/Break: ${term_or_break}\n`);

        // 1. We first fetch all students for the given year and term/break
        const { data: students, error: studentError } = await supabaseAdmin!
            .from('term_students')
            .select('*')
            .eq('year', year)
            .eq('term_or_break', term_or_break);
        if (studentError) throw studentError;

        // console.log('DEBUG: Students fetched:', students);

        // 2. We then fetch the desk details
        const { data: desks, error: deskError } = await supabaseAdmin!
            .from('term_desks')
            .select('*')
            .eq('desk_name', desk_name)
            .eq('term_or_break', term_or_break);

        // console.log('DEBUG: Desk fetched:', desks);

        // Throw error if no desk found
        if (deskError) throw deskError;

        if (!desks?.length) {
            throw new Error(`No desk found with name ${desk_name} for ${term_or_break}`);
        }

        // 3. We then fetch the desk's shifts
        const { data: slots, error: slotError } = await supabaseAdmin!
            .from('term_slots')
            .select('*, term_shifts(*)')
            .eq('desk_id', desks[0].id);
        if (slotError) throw slotError;

        // console.log('DEBUG: Slots fetched:', slots);

        // 4) We then create a set of all the days we need to process [Mon -Sun]
        const days = new Set((slots || []).map(slot => slot.day_of_week));

         // 5) Fetch availability for all relevant days
        const availabilityPromises = Array.from(days).map(day =>
            supabaseAdmin!
                .from('term_student_availability_slots')
                .select('*')
                .eq('day_of_week', day)
                .in('scheduled_status', ['1st Choice', '2nd Choice'])
        );

        const availabilityResults = await Promise.all(availabilityPromises);
        const availability = availabilityResults.flatMap(result => result.data || []);

        // console.log('DEBUG: Availabilities fetched:', availability);

        // 6) Build availability map
        const availabilityMap = new Map<string, string>();
        for (const rec of availability as TermStudentAvailability[]) {
            const key = `${rec.term_student_id}|${rec.day_of_week}|${rec.time_slot}`;
            availabilityMap.set(key, rec.scheduled_status);
        }

        // Sort students by seniority
        const sortedStudents = (students || []).sort((a, b) => (b.seniority || 0) - (a.seniority || 0));

        // console.log('DEBUG: Sorted students:', sortedStudents);

        // Track assignments
        const shiftAssignments = new Map<string, string[]>();

         // Initialize current assignments
         for (const slot of (slots || [])) {
            for (const shift of (slot.term_shifts || [])) {
                const current = (shift.students_detailed || [])
                    .filter((name: string) => name.toLowerCase() !== 'open');
                shiftAssignments.set(shift.id, current);
            }
        }

        // Track assigned time slots for each student
        const studentAssignedTimeSlots = new Map<string, Set<string>>();

        // Process each student
        let totalAssignedShifts = 0;

        // Store assigned availability IDs
        const assignedAvailabilityIds = new Set<string>(); 
        
        for (const student of sortedStudents) {
            const jobs = student.jobs ? student.jobs.split(',') : [];

            // a. We first check if the student is eligible for the desk
            if (!isEligibleForDesk(jobs, desk_name)) {
                logSummary.push(`Skipping ${student.preferred_name} (not eligible for desk)`);
                continue;
            }
            console.log(`Processing ${student.preferred_name}...`);

            // b. If we are considering preferred desk, we check if the current desk is student's preferred desk
            if (consider_preferred_desk &&
                student.preferred_desk?.toLowerCase() !== desk_name.toLowerCase()) {
                logSummary.push(`Skipping ${student.preferred_name} as their preferred desk is ${student.preferred_desk}`);
                continue;
            }

            // c. We then set the maximum assignments for the student
            let maxAssignmentsForStudent;

            if (set_to_max_shifts) {
                // If set_to_max_shifts is true, calculate remaining shifts
                const remainingShifts = student.max_shifts - (student.assigned_shifts || 0);
                if (remainingShifts <= 0) {
                    logSummary.push(`Skipping ${student.preferred_name} (already reached max_shifts limit of ${student.max_shifts})`);
                    continue; // Skip this student entirely
                }
                maxAssignmentsForStudent = remainingShifts;
            } else {
                // Otherwise use shifts_to_assign but don't exceed student.max_shifts if it exists
                maxAssignmentsForStudent = student.max_shifts ? Math.min(student.max_shifts, shifts_to_assign) : shifts_to_assign;
            }

            const currentAssignedShifts = student.assigned_shifts || 0;
            if (currentAssignedShifts >= student.max_shifts) {
                logSummary.push(`Skipping ${student.preferred_name} (already reached max_shifts limit of ${student.max_shifts})`);
                continue;
            }

            let assignedSoFar = 0;
            const assignedShiftsByDay: Record<string, TermShift[]> = {};

            // Initialize assigned time slots for this student
            if (!studentAssignedTimeSlots.has(student.id)) {
                studentAssignedTimeSlots.set(student.id, new Set<string>());
            }

            // Process slots for this student
            for (const slot of (slots || [])) {
                if (assignedSoFar >= maxAssignmentsForStudent) break;

                const sortedShifts = (slot.term_shifts || []).sort((a: TermShift, b: TermShift) =>
                    (a.start_time || '').localeCompare(b.start_time || '')
                );

                for (const shift of sortedShifts) {
                    if (assignedSoFar >= maxAssignmentsForStudent) break;

                    const shiftTimeSlot = `${shift.start_time} - ${shift.end_time}`;
                    const key = `${student.id}|${slot.day_of_week}|${shiftTimeSlot}`;
                    // console.log("Key:", key);
                    const availabilityStatus = availabilityMap.get(key);

                    if (!availabilityStatus || !['1st Choice', '2nd Choice'].includes(availabilityStatus)) {
                        logSummary.push(`Skipping ${student.preferred_name} as they are not available for ${slot.day_of_week} ${shiftTimeSlot}`);
                        continue;
                    }
                    // console.log(`Processing ${student.preferred_name} for ${slot.day_of_week} ${shiftTimeSlot} status is ${availabilityStatus}`);

                    // Skip if not available
                    if (!availabilityStatus || availabilityStatus === 'Not Available') continue;

                    // Check if already assigned to another shift in the same time slot
                    const studentTimeSlotKey = `${student.id}|${slot.date}|${shiftTimeSlot}`;
                    if (studentAssignedTimeSlots.get(student.id)?.has(studentTimeSlotKey)) {
                        logSummary.push(`Skipping ${student.preferred_name} (already assigned to this time slot)`);
                        continue;
                    }
 
                    // Check capacity and existing assignments
                    const currentAssignments = shiftAssignments.get(shift.id) || [];
                    if (currentAssignments.includes(student.preferred_name) ||
                        !hasAvailableSpace(shift, currentAssignments)) {
                        continue;
                    }
 
                    // Check consecutive shifts
                    const alreadyAssignedShifts = assignedShiftsByDay[slot.day_of_week] || [];
                    if (alreadyAssignedShifts.length > 0 && !alreadyAssignedShifts.some(existing => isConsecutive(existing, shift))) {
                        console.log(`DEBUG: ${student.preferred_name} cannot be assigned to shift ${shift.day_of_week} | ${shift.time_slot} due to non-consecutive shifts.`);
                        continue;
                    }

                    // Update assignment
                    const newAssignments = [...currentAssignments, student.preferred_name];
                    const remainingSlots = Math.max(0, (shift.max_students || 1) - newAssignments.length);
                    const updatedStudents = [...newAssignments, ...Array(remainingSlots).fill('Open')];
 
                    if (await updateShiftDetails(shift.id, updatedStudents)) {
                        shiftAssignments.set(shift.id, newAssignments);
                        assignedShiftsByDay[slot.day_of_week] = [...alreadyAssignedShifts, shift];
                        assignedSoFar++;
                        totalAssignedShifts++;
 
                        // Add to log summary with additional details
                        logSummary.push(`Assigned ${student.preferred_name} to a shift on ${slot.day_of_week} (${shiftTimeSlot})`);
                        console.log(`DEBUG: Assigned ${student.preferred_name} to a shift on ${slot.day_of_week} (${shiftTimeSlot})`);
 
                        // Mark this availability as assigned
                        assignedAvailabilityIds.add(studentTimeSlotKey);
                        studentAssignedTimeSlots.get(student.id)?.add(studentTimeSlotKey);

                        await supabaseAdmin!.from('term_student_availability_slots')
                            .update({ scheduled_status: desk_name })
                            .eq('term_student_id', student.id)
                            .eq('day_of_week', slot.day_of_week)
                            .eq('time_slot', shiftTimeSlot);
                    } 
                }
            }

            if (assignedSoFar > 0) {
                const newAssignedShifts = (student.assigned_shifts || 0) + assignedSoFar;

                // Ensure assigned_shifts does not exceed max_shifts
                if (newAssignedShifts > student.max_shifts) {
                    logSummary.push(`ERROR: ${student.preferred_name} would exceed max_shifts limit (${student.max_shifts}). Adjusting assigned_shifts.`);
                    await supabaseAdmin!.from('term_students')
                        .update({ assigned_shifts: student.max_shifts })
                        .eq('id', student.id);
                } else {
                    await supabaseAdmin!.from('term_students')
                        .update({ assigned_shifts: newAssignedShifts })
                        .eq('id', student.id);
                }

                logSummary.push(`Updated ${student.preferred_name} with +${assignedSoFar} shifts (total: ${newAssignedShifts})`);
            }
        }

        logSummary.push(`Total shifts assigned: ${totalAssignedShifts}`);

        // Save summary
        const { error: summaryError } = await supabaseAdmin!
            .from('student_assignments')
            .insert([{
                year,
                term_or_break,
                desk_name,
                round_number,
                set_to_max_shifts,
                shifts_to_assign,
                consider_preferred_desk,
                log_summary: logSummary.join('\n'),
            }]);

        if (summaryError) {
            console.error('Error inserting log summary:', summaryError);
        }

        // console.log("Log summary:", logSummary);
        return NextResponse.json({ message: 'Assignments completed', logSummary }, { status: 200 });
    } catch (error) {
        console.error('ERROR:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}




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
        return NextResponse.json({ error: 'Failed to fetch term assignments' }, { status: 500 });
    }
}