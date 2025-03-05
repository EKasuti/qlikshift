import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Interface for the slot data
interface SlotData {
    id: number;
    date: string;
    interim_shifts?: ShiftData[];
}

interface ShiftData {
    interim_slot_id: number;
    start_time: string;
    end_time: string;
    students_detailed: string[];
}

// Interface for the Excel row data
interface ExcelRowData {
    Date: string;
    '08:00:00 - 10:00:00': string;
    '10:00:00 - 12:00:00': string;
    '12:00:00 - 14:00:00': string;
    '14:00:00 - 16:00:00': string;
    '16:00:00 - 18:00:00': string;
    '18:00:00 - 20:00:00': string;
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

        // Finding the desk
        const { data: deskData, error: deskError } = await supabaseAdmin
            .from('interim_desks')
            .select('id, desk_name, year, term_or_break')
            .eq('desk_name', desk.toLowerCase())
            .eq('year', year)
            .eq('term_or_break', term)
            .single();

        if (deskError) throw deskError;

        if (!deskData) {
            return NextResponse.json(
                { error: 'No matching desk found' },
                { status: 404 }
            );
        }

        // Fetch slots for this desk
        const { data: slotsData, error: slotsError } = await supabaseAdmin
            .from('interim_slots')
            .select('id, date')
            .eq('interim_desk_id', deskData.id);

        if (slotsError) throw slotsError;

        // Fetch shifts for these slots
        const slotIds = slotsData.map(slot => slot.id);
        const { data: shiftsData, error: shiftsError } = await supabaseAdmin
            .from('interim_shifts')
            .select('interim_slot_id, start_time, end_time, students_detailed')
            .in('interim_slot_id', slotIds);

        if (shiftsError) throw shiftsError;

        // Combine slots and shifts
        const combinedData = slotsData.map(slot => ({
            ...slot,
            interim_shifts: shiftsData.filter(shift =>
                shift.interim_slot_id === slot.id
            )
        }));

        // Prepare Excel data
        const excelData = prepareExcelData(combinedData);

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Desk Schedule');

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'buffer'
        });

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
        return NextResponse.json(
            {
                error: 'Failed to export desk schedule',
                details: String(error)
            },
            { status: 500 }
        );
    }
}

function prepareExcelData(slotsData: SlotData[]): ExcelRowData[] {
    const excelRows: ExcelRowData[] = [];

    // Iterate through slots
    slotsData.forEach((slot: SlotData) => {
        const date = formatDate(slot.date);

        // Group shifts by time slot
        const timeSlots = [
            { range: '08:00:00 - 10:00:00', index: 0 },
            { range: '10:00:00 - 12:00:00', index: 1 },
            { range: '12:00:00 - 14:00:00', index: 2 },
            { range: '14:00:00 - 16:00:00', index: 3 },
            { range: '16:00:00 - 18:00:00', index: 4 },
            { range: '18:00:00 - 20:00:00', index: 5 }
        ];

        const rowData: ExcelRowData = {
            Date: date,
            '08:00:00 - 10:00:00': 'Closed',
            '10:00:00 - 12:00:00': 'Closed',
            '12:00:00 - 14:00:00': 'Closed',
            '14:00:00 - 16:00:00': 'Closed',
            '16:00:00 - 18:00:00': 'Closed',
            '18:00:00 - 20:00:00': 'Closed'
        };

        // Process shifts for this slot
        (slot.interim_shifts || []).forEach((shift: ShiftData) => {
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

// Function to convert date from YYYY-MM-DD to DD-MM-YYYY
function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}