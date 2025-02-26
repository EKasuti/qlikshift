import { supabaseAdmin } from '@/lib/supabase';
import * as xlsx from 'xlsx';

// ExcelRow names
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

// Term Student interface
interface TermStudent {
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
    availability: Record<string, { status: string; day: string; time: string }>;
}

// Term Availability slots
interface TermAvailabilitySlot {
    term_student_id: string;
    day_of_week: string;
    time_slot: string;
    availability_status: string;
    scheduled_status: string
}

function convertExcelTime(timeStr: string): string {
    const time = timeStr.toLowerCase().replace(/\s/g, '');
    const match = time.match(/(\d+)(am|pm)/);
    if (!match) throw new Error(`Invalid time format: ${timeStr}`);

    let hours = parseInt(match[1]);
    const period = match[2];

    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:00`;
}

function parseTimeSlotHeader(header: string): { day: string; time: string } {
    const match = header.match(/^(\w+)\s+(\d+[ap]m)-(\d+[ap]m)$/i);
    if (!match) throw new Error(`Invalid time slot header: ${header}`);

    const day = match[1];
    const startTime = convertExcelTime(match[2]);
    const endTime = convertExcelTime(match[3]);

    return {
        day,
        time: `${startTime} - ${endTime}`
    };
}

// POST function to store Term Students from excel sheet
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
            header.match(/^\w+\s+\d+[ap]m-\d+[ap]m$/i)
        );

        const students: TermStudent[] = jsonData.map(row => {
            const student: TermStudent = {
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
                    const { time, day } = parseTimeSlotHeader(header);
                    const value = row[header];

                    const key = `${time}-${day}`;
                    student.availability[key] = {
                        status: typeof value === 'string' ? value.trim() : 'Unavailable',
                        day,
                        time
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
            .from('term_students')
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
                { onConflict: 'email,year,term_or_break' }
            )
            .select('id, email, year, term_or_break');

        if (upsertError) throw upsertError;

        const availabilitySlots: TermAvailabilitySlot[] = [];

        for (const student of students) {
            const dbStudent = dbStudents.find(s =>
                s.email === student.email &&
                s.year === student.year &&
                s.term_or_break === student.termOrBreak
            );

            if (!dbStudent) continue;

            await supabaseAdmin
                .from('term_student_availability_slots')
                .delete()
                .match({
                    term_student_id: dbStudent.id
                });

            Object.entries(student.availability).forEach(([, { status, day, time }]) => {
                if (day && time) {
                    availabilitySlots.push({
                        term_student_id: dbStudent.id,
                        day_of_week: day,
                        time_slot: time,
                        availability_status: status,
                        scheduled_status: status
                    });
                }
            });
        }

        const { error: slotError } = await supabaseAdmin
            .from('term_student_availability_slots')
            .insert(availabilitySlots);

        if (slotError) throw slotError;

        return new Response(JSON.stringify({
            message: 'Import successful',
            stats: {
                students: dbStudents.length,
                slots: availabilitySlots.length
            }
        }), { status: 200 });

    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
    }
}

// GET function to retrieve Term Students
export async function GET(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Database connection failed');

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const term = searchParams.get('term_or_break');

        let query = supabaseAdmin
            .from('term_students')
            .select(`*, term_student_availability_slots (day_of_week, time_slot, availability_status, scheduled_status)`)
            .order('preferred_name', { ascending: true });

        if (year) query = query.eq('year', year);
        if (term) query = query.eq('term_or_break', term);

        const { data, error } = await query;

        if (error) throw error;

        if (!year && !term) {
            const grouped = data.reduce((acc: Record<string, { year: string; term_or_break: string; students: TermStudent[] }>, student) => {
                const key = `${student.year}_${student.term_or_break}`;
                if (!acc[key]) {
                    acc[key] = {
                        year: student.year,
                        term_or_break: student.term_or_break,
                        students: []
                    };
                }
                acc[key].students.push(student);
                return acc;
            }, {});

            return new Response(JSON.stringify(Object.values(grouped)), {
                status: 200
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
    }
}