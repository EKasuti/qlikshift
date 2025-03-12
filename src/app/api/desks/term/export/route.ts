import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Interface for the slot data
interface TermSlot {
    id: number;
    day_of_week: string;
    term_shifts?: TermShift[];
}

interface TermShift {
    term_slot_id: number;
    start_time: string;
    end_time: string;
    students_detailed: string[];
}

// Interface for the Excel row data
interface ExcelRowData {
    Day: string;
    '08:00:00 - 10:00:00': string;
    '10:00:00 - 12:00:00': string;
    '12:00:00 - 14:00:00': string;
    '14:00:00 - 16:00:00': string;
    '16:00:00 - 18:00:00': string;
    '18:00:00 - 20:00:00': string;
    '20:00:00 - 22:00:00': string;
    '22:00:00 - 00:00:00': string;
}

function prepareExcelData(slotsData: TermSlot[]): ExcelRowData[] {
    const excelRows: ExcelRowData[] = [];

    // Iterate through slots
    slotsData.forEach((slot: TermSlot) => {
        const day = slot.day_of_week;

        // Group shifts by time slot
        const timeSlots = [
            { range: '08:00:00 - 10:00:00', index: 0 },
            { range: '10:00:00 - 12:00:00', index: 1 },
            { range: '12:00:00 - 14:00:00', index: 2 },
            { range: '14:00:00 - 16:00:00', index: 3 },
            { range: '16:00:00 - 18:00:00', index: 4 },
            { range: '18:00:00 - 20:00:00', index: 5 },
            { range: '20:00:00 - 22:00:00', index: 6 },
            { range: '22:00:00 - 00:00:00', index: 7 }
        ];

        const rowData: ExcelRowData = {
            Day: day,
            '08:00:00 - 10:00:00': 'Closed',
            '10:00:00 - 12:00:00': 'Closed',
            '12:00:00 - 14:00:00': 'Closed',
            '14:00:00 - 16:00:00': 'Closed',
            '16:00:00 - 18:00:00': 'Closed',
            '18:00:00 - 20:00:00': 'Closed',
            '20:00:00 - 22:00:00': 'Closed',
            '22:00:00 - 00:00:00': 'Closed'
        };

        // Process shifts for this slot
        (slot.term_shifts || []).forEach((shift: TermShift) => {
            const matchingTimeSlot = timeSlots.find(
                ts => ts.range === `${shift.start_time} - ${shift.end_time}`
            );

            if (matchingTimeSlot) {
                // Combine students, remove 'Open' entries
                const students = (shift.students_detailed || [])
                    .filter((student: string) => student !== 'Open')
                    .join(', ');

                rowData[matchingTimeSlot.range as keyof ExcelRowData] = students || 'Open';
            }
        });

        excelRows.push(rowData);
    });

    return excelRows;
}

export async function GET(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const term = searchParams.get('term_or_break');
        const desk = searchParams.get('desk');

        if (!year || !term || !desk) {
            return NextResponse.json(
                { error: 'Year, term, and desk name are required' },
                { status: 400 }
            );
        }

        // 1. We first find the desk
        const { data: deskData, error: deskError } = await supabaseAdmin
            .from('term_desks')
            .select('id, desk_name, year, term_or_break')
            .eq('desk_name', desk.toLowerCase())
            .eq('year', year)
            .eq('term_or_break', term)
            .single();

        // console.log("DEBUG: deskData", deskData);
        if (deskError) throw deskError;

        if (!deskData) {
            return NextResponse.json({ error: 'No matching desk found' }, { status: 404 });
        }

        // 2. Then find the term slots for the desk
        const { data: slotsData, error: slotsError } = await supabaseAdmin
            .from('term_slots')
            .select('id, day_of_week')
            .eq('desk_id', deskData.id);

        if (slotsError) throw slotsError;

        // 3. For each slot, we get the shifts
        const slotIds = slotsData.map(slot => slot.id);
        const { data: shiftsData, error: shiftsError } = await supabaseAdmin
            .from('term_shifts')
            .select('term_slot_id, start_time, end_time, students_detailed')
            .in('term_slot_id', slotIds);

        if (shiftsError) throw shiftsError;

        // 4. We then combine the slots and shifts for easier export
        const combinedData = slotsData.map(slot => ({
            ...slot,
            term_shifts: shiftsData.filter(shift =>
                shift.term_slot_id === slot.id
            )
        }));

        // console.log("DEBUG: combinedData", combinedData);

        // 5. Next we prepare the data for Excel export using helper function prepareExcelData
        const excelData = prepareExcelData(combinedData);

        // 6. Then we create an Excel worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Term Desk Schedule');

        // 7. Finally, we write the workbook to a buffer and create a response with the Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Create response with Excel file
        const response = new NextResponse(excelBuffer, {
            status: 200,
            headers: new Headers({
                'Content-Disposition': `attachment; filename="${desk}_${year}_${term}_schedule.xlsx"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
        });

        return response;

    } catch (error) {
        return NextResponse.json({ error: 'Failed to export term desk schedule', details: String(error) }, { status: 500 });
    }
}