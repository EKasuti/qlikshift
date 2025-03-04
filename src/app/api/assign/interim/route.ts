import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Shift Interface
interface Shift {
    id: string;
    max_students?: number;
    students_detailed?: string[];
    start_time?: string;
    end_time?: string;
}

// Student availability Interface
interface StudentAvailability {
    id: string;
    student_id: string;
    day_of_week: string;
    time_slot: string;
    availability_status: string;
    date: string;
    created_at: string;
}

// Function to update shift details
async function updateShiftDetails(shiftId: string, updatedStudents: string[]): Promise<boolean> {
    console.log('DEBUG: Updating shift details in DB for shiftId:', shiftId);
    console.log('DEBUG: Updated students:', updatedStudents);

    const { error } = await supabaseAdmin!
        .from('interim_shifts')
        .update({ students_detailed: updatedStudents })
        .eq('id', shiftId);

    if (error) {
        console.error(`Error updating shift ${shiftId}:`, error);
        return false;
    }
    return true;
}

// Function to check if student is eligible for desk
function isEligibleForDesk(studentJobs: string[], deskName: string): boolean {
    return studentJobs
        .map(job => job.trim().toLowerCase())
        .includes(deskName.toLowerCase());
}

// Function to check if a shift slot has space
function hasAvailableSpace(shift: Shift, currentAssignments: string[]): boolean {
    const maxStudents = shift.max_students || 1;
    return currentAssignments.length < maxStudents;
}

// Function to check if it's consecutive
function isConsecutive(existing: Shift, candidate: Shift): boolean {
    return existing.end_time === candidate.start_time || candidate.end_time === existing.start_time;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { desk_name, year, term_or_break, round_number, set_to_max_shifts, shifts_to_assign, consider_preferred_desk } = body;

        console.log('DEBUG: Incoming request body:', body);

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

        const logSummary: string[] = [];
        logSummary.push(`Processing assignments for Desk: ${desk_name}, Year: ${year}, Term/Break: ${term_or_break}`);

        const { data: students, error: studentError } = await supabaseAdmin!
            .from('interim_students')
            .select('*')
            .eq('year', year)
            .eq('term_or_break', term_or_break);
        if (studentError) throw studentError;

        // 2) Fetch desk info
        const { data: desks, error: deskError } = await supabaseAdmin!
            .from('interim_desks')
            .select('*')
            .eq('desk_name', desk_name)
            .eq('term_or_break', term_or_break);
        if (deskError) throw deskError;
        if (!desks?.length) {
            throw new Error(`No desk found with name ${desk_name} for ${term_or_break}`);
        }

        // 3) Fetch slots and shifts
        const { data: slots, error: slotError } = await supabaseAdmin!
            .from('interim_slots')
            .select('*, interim_shifts(*)')
            .eq('interim_desk_id', desks[0].id);
        if (slotError) throw slotError;

        // 4) Create a set of all dates we need to check
        const dates = new Set((slots || []).map(slot => slot.date));

        // 5) Fetch availability for all relevant dates
        const availabilityPromises = Array.from(dates).map(date =>
            supabaseAdmin!
                .from('interim_student_availability_slots')
                .select('*')
                .eq('date', date)
        );

        const availabilityResults = await Promise.all(availabilityPromises);
        const availability = availabilityResults.flatMap(result => result.data || []);

        // 6) Build availability map
        const availabilityMap = new Map<string, string>();
        for (const rec of availability as StudentAvailability[]) {
            const key = `${rec.student_id}|${rec.date}|${rec.time_slot}`;
            availabilityMap.set(key, rec.availability_status);
        }

        // Sort students by seniority
        const sortedStudents = (students || []).sort((a, b) => (b.seniority || 0) - (a.seniority || 0));

        // Track assignments
        let totalAssignedShifts = 0;
        const shiftAssignments = new Map<string, string[]>();

        // Initialize current assignments
        for (const slot of (slots || [])) {
            for (const shift of (slot.interim_shifts || [])) {
                const current = (shift.students_detailed || [])
                    .filter((name: string) => name.toLowerCase() !== 'open');
                shiftAssignments.set(shift.id, current);
            }
        }

        // Process each student
        for (const student of sortedStudents) {
            const jobs = student.jobs ? student.jobs.split(',') : [];

            // Check eligibility
            if (!isEligibleForDesk(jobs, desk_name)) {
                logSummary.push(`Skipping ${student.preferred_name} (not eligible for desk)`);
                continue;
            }

            // Check preferred desk
            if (consider_preferred_desk &&
                student.preferred_desk?.toLowerCase() !== desk_name.toLowerCase()) {
                logSummary.push(`Skipping ${student.preferred_name} (preferred desk mismatch)`);
                continue;
            }

            const maxAssignmentsForStudent = set_to_max_shifts && student.max_shifts
                ? Math.floor(student.max_shifts / 2)
                : shifts_to_assign;

            let assignedSoFar = 0;
            const assignedShiftsByDate: Record<string, Shift[]> = {};

            // Process slots for this student
            for (const slot of (slots || [])) {
                if (assignedSoFar >= maxAssignmentsForStudent) break;

                const sortedShifts = (slot.interim_shifts || []).sort((a: Shift, b: Shift) =>
                    (a.start_time || '').localeCompare(b.start_time || '')
                );

                for (const shift of sortedShifts) {
                    if (assignedSoFar >= maxAssignmentsForStudent) break;

                    const shiftTimeSlot = `${shift.start_time} - ${shift.end_time}`;
                    const key = `${student.id}|${slot.date}|${shiftTimeSlot}`;

                    const availabilityStatus = availabilityMap.get(key);

                    // Skip if not available
                    if (!availabilityStatus || availabilityStatus === 'Not Available') continue;

                    // Check capacity and existing assignments
                    const currentAssignments = shiftAssignments.get(shift.id) || [];
                    if (currentAssignments.includes(student.preferred_name) ||
                        !hasAvailableSpace(shift, currentAssignments)) continue;

                    // Check consecutive shifts
                    const alreadyAssignedShifts = assignedShiftsByDate[slot.date] || [];
                    const canAssign = alreadyAssignedShifts.length === 0 ||
                        alreadyAssignedShifts.some(existing => isConsecutive(existing, shift));

                    if (!canAssign) continue;

                    // Update assignment
                    const newAssignments = [...currentAssignments, student.preferred_name];
                    const remainingSlots = Math.max(0, (shift.max_students || 1) - newAssignments.length);
                    const updatedStudents = [...newAssignments, ...Array(remainingSlots).fill('Open')];

                    const ok = await updateShiftDetails(shift.id, updatedStudents);
                    if (ok) {
                        shiftAssignments.set(shift.id, newAssignments);
                        assignedShiftsByDate[slot.date] = [...alreadyAssignedShifts, shift];
                        assignedSoFar++;
                        totalAssignedShifts++;
                        logSummary.push(`Assigned ${student.preferred_name} to ${slot.date} (${shiftTimeSlot}) [${availabilityStatus}]`);

                        // Update student's assigned shifts count
                        await supabaseAdmin!
                            .from('interim_students')
                            .update({ assigned_shifts: (student.assigned_shifts || 0) + 1 })
                            .eq('id', student.id);

                        // Update availability status to desk name
                        await supabaseAdmin!
                            .from('interim_student_availability_slots')
                            .update({ scheduled_status: desk_name })
                            .eq('student_id', student.id)
                            .eq('date', slot.date)
                            .eq('time_slot', shiftTimeSlot);
                    }
                }
            }
            if (assignedSoFar === 0) {
                logSummary.push(`No assignment made for ${student.preferred_name}`);
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

        return NextResponse.json({ message: 'Assignments completed', logSummary }, { status: 200 });
    } catch (error) {
        console.error('ERROR:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

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