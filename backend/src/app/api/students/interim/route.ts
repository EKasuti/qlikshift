import { setCorsHeaders } from '@/lib/cors';
import { supabaseAdmin } from '@/lib/supabase';
import * as xlsx from 'xlsx';

interface ExcelRow {
    'Preferred Name'?: string;
    'Email'?: string;
    'Working'?: string;
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
    isWorking: boolean;
    isSub: boolean;
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

function isTimeSlotHeader(header: string): boolean {
    // Normalize the header by replacing line breaks and standardizing spaces
    const normalizedHeader = header.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();

    // General pattern: Day Followed by Date, Followed by Time Range
    const dayPattern = /^(mon|tue|wed|thu|fri|sat|sun)/i;
    const datePattern = /\d+\/\d+/;
    
    // Updated time pattern to catch "12noon" format
    const timePattern = /\d+\s*(?:am|pm|noon)[-–—]\s*\d+\s*(?:am|pm|noon)/i;
    const noonTimePattern = /\d+noon[-–—]\s*\d+\s*(?:am|pm)/i;

    return dayPattern.test(normalizedHeader) &&
        datePattern.test(normalizedHeader) &&
        (timePattern.test(normalizedHeader) || noonTimePattern.test(normalizedHeader));
}

function parseTimeSlotHeader(header: string): { day: string; time: string; date: string } {
    // Normalize the header
    const normalizedHeader = header.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();

    // Extract day of week
    const dayMatch = normalizedHeader.match(/^(mon|tue|wed|thu|fri|sat|sun)/i);
    if (!dayMatch) throw new Error(`Could not extract day from header: ${normalizedHeader}`);
    const day = dayMatch[0].charAt(0).toUpperCase() + dayMatch[0].slice(1).toLowerCase();

    // Extract date
    const dateMatch = normalizedHeader.match(/(\d+\/\d+)/);
    if (!dateMatch) throw new Error(`Could not extract date from header: ${normalizedHeader}`);
    const dateString = dateMatch[1]; // Format: MM/DD

    // Handle the case when "noon" is attached to a number (e.g., "12noon")
    let modifiedHeader = normalizedHeader;
    if (modifiedHeader.includes('noon')) {
        modifiedHeader = modifiedHeader.replace(/(\d+)noon/i, '$1 noon');
    }

    // Extract time range with more flexible pattern
    const timeRangeMatch = 
        modifiedHeader.match(/(\d+)\s*([ap]m|noon)-\s*(\d+)\s*([ap]m|noon)/i) || 
        modifiedHeader.match(/(\d+)\s*noon\s*-\s*(\d+)\s*([ap]m)/i);

    if (!timeRangeMatch) throw new Error(`Could not extract time range from header: ${modifiedHeader}`);

    let startTime, startPeriod, endTime, endPeriod;

    // Handle different match patterns
    if (timeRangeMatch[2] && (timeRangeMatch[2].toLowerCase() === 'am' || 
                              timeRangeMatch[2].toLowerCase() === 'pm' || 
                              timeRangeMatch[2].toLowerCase() === 'noon')) {
        // First pattern matched: normal time range
        startTime = timeRangeMatch[1];
        startPeriod = timeRangeMatch[2].toLowerCase();
        endTime = timeRangeMatch[3];
        endPeriod = timeRangeMatch[4].toLowerCase();
    } else {
        // Second pattern matched: "12noon - 2pm" format
        startTime = timeRangeMatch[1];
        startPeriod = 'noon';
        endTime = timeRangeMatch[2];
        endPeriod = timeRangeMatch[3].toLowerCase();
    }

    // Handle "noon" special case
    if (startPeriod === 'noon') startPeriod = 'pm';
    if (endPeriod === 'noon') endPeriod = 'pm';

    // Convert to 24-hour format
    const startHour = (startPeriod === 'pm' && startTime !== '12') ? parseInt(startTime) + 12 : (startPeriod === 'am' && startTime === '12' ? 0 : parseInt(startTime));
    const endHour = (endPeriod === 'pm' && endTime !== '12') ? parseInt(endTime) + 12 : (endPeriod === 'am' && endTime === '12' ? 0 : parseInt(endTime));

    // Format the date correctly
    const currentYear = new Date().getFullYear();
    const formattedDate = formatDate(`${currentYear}-${dateString}`);

    return {
        day,
        time: `${String(startHour).padStart(2, '0')}:00:00 - ${String(endHour).padStart(2, '0')}:00:00`, // Format as HH:mm:ss
        date: formattedDate
    };
}

// POST function to store Interim Students from excel sheet
export async function POST(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Database connection failed');
        console.log('Database connection established.');

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const year = formData.get('year') as string;
        const termOrBreak = formData.get('term_or_break') as string;

        if (!file || !year || !termOrBreak) {
            console.error('Missing required fields:', { file, year, termOrBreak });
            return setCorsHeaders(new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 }));
        }

        const buffer = await file.arrayBuffer();
        const workbook = xlsx.read(new Uint8Array(buffer), { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: ExcelRow[] = xlsx.utils.sheet_to_json(sheet, { defval: undefined });

        // Filter for time slot headers using our more robust method
        const timeSlotHeaders = Object.keys(jsonData[0]).filter(isTimeSlotHeader);

        if (timeSlotHeaders.length === 0) {
            console.error('No time slot headers found. Sample headers:', Object.keys(jsonData[0]).slice(0, 10));
            return setCorsHeaders(new Response(JSON.stringify({
                error: 'No time slot headers detected in the Excel file'
            }), { status: 400 }));
        }

        const students: InterimStudent[] = jsonData.map(row => {
            const student: InterimStudent = {
                preferredName: row['Preferred Name']?.toString().trim() || '',
                email: row['Email']?.toString().trim() || '',
                jobs: row['Jobs']?.toString().trim(),
                preferredDesk: row['Preferred Desk']?.toString().trim() || '',
                preferredHoursPerWeek: Number(row['Preferred Hours Per Week'] || 0),
                preferredHoursInARow: Number(row['Preferred Hours In A Row'] || 0),
                seniority: Number(row['Seniority']) || 0,
                assignedShifts: 0,
                maxShifts: Math.max(10, Math.floor(Number(row['Preferred Hours Per Week'] || 0) / 2)),
                year: year.trim(),
                termOrBreak: termOrBreak.trim(),
                availability: {},
                isWorking: false,
                isSub: false
            };

            // Set isWorking and isSub based on the 'Working' field
            const workingStatus = row['Working']?.toString().trim();
            if (workingStatus === "Working (scheduled shifts)") {
                student.isWorking = true;
                student.isSub = false;
            } else if (workingStatus === "Working (sub)") {
                student.isWorking = true;
                student.isSub = true;
            } else if (workingStatus === "Not working") {
                student.isWorking = false;
                student.isSub = false;
            }

            timeSlotHeaders.forEach(header => {
                try {
                    const { time, day, date } = parseTimeSlotHeader(header);
                    const value = row[header];

                    const availabilityStatus = typeof value === 'string'
                        ? value.trim()
                        : (student.isSub ? 'Sub' : (student.isWorking ? 'Unavailable' : 'Not Available'));

                    const key = `${time}-${day}-${date}`;
                    student.availability[key] = {
                        status: availabilityStatus,
                        day,
                        time,
                        date
                    };
                } catch (error) {
                    console.warn(`Error processing column: ${header}`, error);
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
                    term_or_break: s.termOrBreak,
                    isworking: s.isWorking,
                    issub: s.isSub
                })),
                { onConflict: 'email, year, term_or_break' }
            )
            .select('id, email, year, term_or_break, isworking, issub');

        if (upsertError) {
            console.error('Error upserting students:', upsertError);
            throw upsertError;
        }

        const availabilitySlots: InterimAvailabilitySlot[] = [];

        for (const student of students) {
            const dbStudent = dbStudents.find(s =>
                s.email === student.email &&
                s.year === student.year &&
                s.term_or_break === student.termOrBreak
            );

            if (!dbStudent) {
                console.warn('No matching database student found for:', student);
                continue;
            }

            await supabaseAdmin
                .from('interim_student_availability_slots')
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

        if (slotError) {
            console.error('Error inserting availability slots:', slotError);
            throw slotError;
        }

        return setCorsHeaders(new Response(JSON.stringify({
            message: 'Import successful for interim students',
            stats: {
                students: dbStudents.length,
                slots: availabilitySlots.length
            }
        }), { status: 200 }));

    } catch (error) {
        console.error('Import error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
        }), { status: 500 }));
    }
}

// GET function
export async function GET(request: Request) {
    try {
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
            .order('seniority', { ascending: false });

        if (year) query = query.eq('year', year);
        if (term) query = query.eq('term_or_break', term);

        const { data, error } = await query;

        if (error) throw error;

        return setCorsHeaders(new Response(JSON.stringify(data), { status: 200 }));

    } catch (error) {
        console.error('Retrieval error:', error);
        return setCorsHeaders(new Response(JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error'
        }), { status: 500 }));
    }
}