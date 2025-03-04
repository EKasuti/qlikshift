// INTERIM DESKS
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');
        const body = await request.json();

        // Check if interim desk already exists for this year and term
        const { data: existingInterimDesk, error: checkError } = await supabaseAdmin
            .from('interim_desks')
            .select()
            .eq('desk_name', body.desk_name)
            .eq('year', body.year)
            .eq('term_or_break', body.term_or_break)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existingInterimDesk) {
            return NextResponse.json({ error: 'An interim desk already exists for this year and term' },{ status: 409 });
        }

        // Create desk
        const { data: interimDesk, error: interimDeskError } = await supabaseAdmin
            .from('interim_desks')
            .insert({
                desk_name: body.desk_name.toLowerCase(),
                term_or_break: body.term_or_break,
                year: body.year,
                opening_time: body.opening_time,
                closing_time: body.closing_time
            })
            .select()
            .single();

        if (interimDeskError) {
            throw interimDeskError;
        }

        // Process interim slots
        for (const slot of body.interim_slots) {
            // Create interim slot
            const { data: interimSlot, error: interimSlotError } = await supabaseAdmin
                .from('interim_slots')
                .insert({
                    interim_desk_id: interimDesk.id,
                    date: formatDate(slot.date),
                })
                .select()
                .single();

            if (interimSlotError) {
                throw interimSlotError;
            }

            // Process shifts for the interim slot
            for (const shift of slot.shifts) {
                const startTime = new Date(`2000-01-01T${shift.start_time}`);
                const endTime = new Date(`2000-01-01T${shift.end_time}`);

                // Create 2-hour slots
                while (startTime < endTime) {
                const slotEndTime = new Date(startTime);
                slotEndTime.setHours(slotEndTime.getHours() + 2);

                // If slot end time exceeds shift end time, use shift end time
                if (slotEndTime > endTime) {
                    slotEndTime.setHours(endTime.getHours(), endTime.getMinutes());
                }

                // Log the data being inserted into the interim_shifts table
                const shiftData = {
                    interim_slot_id: interimSlot.id,
                    start_time: startTime.toTimeString().slice(0, 5),
                    end_time: slotEndTime.toTimeString().slice(0, 5),
                    max_students: shift.max_students || 1, 
                    students_detailed: Array(shift.max_students || 1).fill('Open')
                };

                const { error: shiftError } = await supabaseAdmin
                    .from('interim_shifts')
                    .insert(shiftData);

                if (shiftError) {
                    throw shiftError;
                }

                // Move to the next 2-hour slot
                startTime.setHours(startTime.getHours() + 2);
                }
            }
        }

    return NextResponse.json({ message: 'Interim desk and slots created successfully' }, { status: 201 });
    
    } catch  {
        return NextResponse.json({ error: 'Failed to create interim desk' }, { status: 500 });
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
        .from('interim_desks')
        .select(`*, interim_slots:interim_slots (*, interim_shifts:interim_shifts (*))`)

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
        return NextResponse.json({ error: 'Failed to fetch desks' }, { status: 500 });
    }
}

// Function to convert date from DD-MM-YYYY to YYYY-MM-DD
function formatDate(dateString: string): string {
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
}
