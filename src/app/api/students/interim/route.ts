import { supabaseAdmin } from '@/lib/supabase';
import * as xlsx from 'xlsx';

interface ExcelRow {
    'Preferred Name'?: string;
    'Email'?: string;
    'Jobs'?: string;
    'Preferred Desk'?: string;
    'Preferred Hours Per Week'?: number;
    'Preferred Hours In A Row'?: number;
    'Seniority'?: number;
    'Assigned Shifts'?: number;
    'Max Shifts'?: number;
    [key: string]: string | number | undefined;
}

interface InterimStudent {
    preferredName: string;
    email: string;
    jobs?: string;
    preferredDesk: string;
    preferredHoursPerWeek: number;
    preferredHoursInARow: number;
    seniority: number;
    assignedShifts?: number;
    maxShifts?: number;
    year: string;
    termOrBreak: string;
    availability: Record<string, { status: string; day: string; time: string; date: string }>;
}

interface InterimAvailabilitySlot {
    student_id: string;
    day_of_week: string;
    time_slot: string;
    availability_status: string;
    scheduled_status: string;
    date: string;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateString}`);
    }
    // Format the date to YYYY-MM-DD
    return date.toISOString().split('T')[0];
}

function parseTimeSlotHeader(header: string): { day: string; time: string; date: string } {
    const match = header.match(/^(\w+),\s+(\w+\s+\d+)\s+(\d{4}),\s+(\d+)([ap]m)-(\d+)([ap]m)$/i);
    if (!match) throw new Error(`Invalid time slot header: ${header}`);

    const day = match[1];
    const dateString = `${match[2]} ${match[3]}`;
    const startTime = match[4];
    const startPeriod = match[5];
    const endTime = match[6];
    const endPeriod = match[7];

    // Convert to 24-hour format
    const startHour = (startPeriod === 'pm' && startTime !== '12') ? parseInt(startTime) + 12 : (startPeriod === 'am' && startTime === '12' ? 0 : parseInt(startTime));
    const endHour = (endPeriod === 'pm' && endTime !== '12') ? parseInt(endTime) + 12 : (endPeriod === 'am' && endTime === '12' ? 0 : parseInt(endTime));

    // Format the date correctly
    const formattedDate = formatDate(dateString);

    return {
        day,
        time: `${String(startHour).padStart(2, '0')}:00:00 - ${String(endHour).padStart(2, '0')}:00:00`, // Format as HH:mm:ss
        date: formattedDate // Return the formatted date
    };
}

// POST function to store Interim Students from excel sheet
export async function POST(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Database connection failed');
        
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const year = formData.get('year') as string;
        const termOrBreak = formData.get('term_or_break') as string;

        if (!file || !year || !termOrBreak) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: ExcelRow[] = xlsx.utils.sheet_to_json(sheet, { defval: undefined });

        const timeSlotHeaders = Object.keys(jsonData[0]).filter(header => 
            header.match(/^\w+,\s+\w+\s+\d+\s+\d{4},\s+\d+[ap]m-\d+[ap]m$/i)
        );

        const students: InterimStudent[] = jsonData.map(row => {
            const student: InterimStudent = {
                preferredName: row['Preferred Name']?.trim() || '',
                email: row['Email']?.trim() || '',
                jobs: row['Jobs']?.trim(),
                preferredDesk: row['Preferred Desk']?.trim() || '',
                preferredHoursPerWeek: Number(row['Preferred Hours Per Week'] || 0),
                preferredHoursInARow: Number(row['Preferred Hours In A Row'] || 0),
                seniority: Number(row['Seniority']) || 0,
                assignedShifts: 0,
                maxShifts: Math.max(10, Number(row['Preferred Hours Per Week'] || 0)),
                year: year.trim(),
                termOrBreak: termOrBreak.trim(),
                availability: {}
            };

            timeSlotHeaders.forEach(header => {
                try {
                    const { time, day, date } = parseTimeSlotHeader(header);
                    const value = row[header];

                    const key = `${time}-${day}-${date}`;
                    student.availability[key] = {
                        status: typeof value === 'string' ? value.trim() : 'Unavailable',
                        day,
                        time,
                        date
                    };
                } catch (error) {
                    console.warn(`Skipping invalid column: ${header}`, error);
                }
            });

            return student;
        }).filter(student => 
            student.email && 
            student.preferredName && 
            student.year && 
            student.termOrBreak
        );

        const { data: dbStudents, error: upsertError } = await supabaseAdmin
            .from('interim_students')
            .upsert(
                students.map(s => ({
                    preferred_name: s.preferredName,
                    email: s.email,
                    jobs: s.jobs,
                    preferred_desk: s.preferredDesk,
                    preferred_hours_per_week: s.preferredHoursPerWeek,
                    preferred_hours_in_a_row: s.preferredHoursInARow,
                    seniority: s.seniority,
                    assigned_shifts: s.assignedShifts,
                    max_shifts: s.maxShifts,
                    year: s.year,
                    term_or_break: s.termOrBreak
                })),
                { onConflict: 'email, year, term_or_break' }
            )
            .select('id, email, year, term_or_break');

        if (upsertError) throw upsertError;

        const availabilitySlots: InterimAvailabilitySlot[] = [];
        
        for (const student of students) {
            const dbStudent = dbStudents.find(s => 
                s.email === student.email && 
                s.year === student.year && 
                s.term_or_break === student.termOrBreak
            );

            if (!dbStudent) continue;

            await supabaseAdmin
                .from('interim_students_availability_slots')
                .delete()
                .match({
                    student_id: dbStudent.id,
                    year: student.year,
                    term_or_break: student.termOrBreak
                });

            Object.entries(student.availability).forEach(([, { status, day, time, date }]) => {
                if (day && time) {
                    availabilitySlots.push({
                        student_id: dbStudent.id,
                        day_of_week: day,
                        time_slot: time,
                        availability_status: status,
                        scheduled_status: status,
                        date
                    });
                }
            });
        }

        const { error: slotError } = await supabaseAdmin
            .from('interim_student_availability_slots')
            .insert(availabilitySlots);

        if (slotError) throw slotError;

        return new Response(JSON.stringify({
            message: 'Import successful for interim students',
            stats: {
                students: dbStudents.length,
                slots: availabilitySlots.length
            }
        }), { status: 200 });

    } catch (error) {
        console.error('Import error:', error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error'
        }), { status: 500 });
    }
}

// GET function to retrieve Interim Students
export async function GET(request: Request) {
    try {
        console.log('Starting GET request for interim students...');

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const term = searchParams.get('term_or_break');

        if (!supabaseAdmin) throw new Error('Database connection failed');
        
        let query = supabaseAdmin
            .from('interim_students')
            .select(`
                *,
                interim_student_availability_slots (
                    day_of_week,
                    time_slot,
                    availability_status,
                    date
                )
            `)
            .order('preferred_name', { ascending: true });

        if (year) query = query.eq('year', year);
        if (term) query = query.eq('term_or_break', term);

        const { data, error } = await query;

        if (error) throw error;

        return new Response(JSON.stringify(data), { status: 200 });

    } catch (error) {
        console.error('Retrieval error:', error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error'
        }), { status: 500 });
    }
}
