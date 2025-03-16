// TERM DESKS
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// POST function to store Term Desks
export async function POST(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');
        const body = await request.json();

        // Check if desk already exists for this year and term
        const { data: existingDesk, error: checkError } = await supabaseAdmin
            .from('term_desks')
            .select()
            .eq('desk_name', body.desk_name)
            .eq('year', body.year)
            .eq('term_or_break', body.term_or_break)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existingDesk) {
            return NextResponse.json({ error: 'A term desk already exists for this year and term' }, { status: 409 });
        }

        // Create desk
        const { data: desk, error: deskError } = await supabaseAdmin
            .from('term_desks')
            .insert({
                desk_name: body.desk_name.toLowerCase(),
                term_or_break: body.term_or_break,
                year: body.year,
                opening_time: body.opening_time,
                closing_time: body.closing_time
            })
            .select()
            .single();

        if (deskError) throw deskError;

        // Process term slots and shifts
        for (const slot of body.term_slots) {
            // Create term slot
            const { data: termSlot, error: termSlotError } = await supabaseAdmin
                .from('term_slots')
                .insert({
                    desk_id: desk.id,
                    day_of_week: slot.day_of_week,
                    is_open: slot.is_open
                })
                .select()
                .single();

            if (termSlotError) throw termSlotError;

            if (slot.is_open) {
                // Create default shifts for the entire day if no shifts are specified
                const shifts = slot.shifts && slot.shifts.length > 0 ? slot.shifts : [{
                    start_time: body.opening_time,
                    end_time: body.closing_time,
                    max_students: 1
                }];

                // Process shifts and create 2-hour slots
                for (const shift of shifts) {
                    let startTime = new Date(`2000-01-01T${shift.start_time}`);
                    const endTime = new Date(`2000-01-01T${shift.end_time}`);

                    // Align start time with desk opening time
                    const openingTime = new Date(`2000-01-01T${body.opening_time}`);
                    if (startTime < openingTime) {
                        startTime = openingTime;
                    }

                    // Create 2-hour slots
                    while (startTime < endTime) {
                        let slotEndTime = new Date(startTime);
                        slotEndTime.setHours(slotEndTime.getHours() + 2);

                        // If slot end time exceeds shift end time, use shift end time
                        if (slotEndTime > endTime) {
                            slotEndTime = endTime;
                        }

                        // Handle midnight case (00:00:00)
                        const endTimeString = slotEndTime.toTimeString().slice(0, 8) === '00:00:00'
                            ? '24:00:00'
                            : slotEndTime.toTimeString().slice(0, 5);

                        // Only create slot if duration is at least 1 hour
                        const durationHours = (slotEndTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                        if (durationHours >= 1) {
                            const { error: shiftError } = await supabaseAdmin
                                .from('term_shifts')
                                .insert({
                                    term_slot_id: termSlot.id,
                                    start_time: startTime.toTimeString().slice(0, 5),
                                    end_time: endTimeString,
                                    max_students: shift.max_students || 1, // use provided value or default to 2
                                    students_detailed: Array(shift.max_students || 2).fill('Open')
                                });

                            if (shiftError) throw shiftError;
                        }

                        startTime.setHours(startTime.getHours() + 2);
                    }
                }
            }
        }

        return NextResponse.json({ message: 'Desk created successfully' }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create desk' }, { status: 500 });
    }
}

// GET function to retrieve Term Data
export async function GET(request: Request) {
    try {
        if (!supabaseAdmin) throw new Error('Could not connect to database');

        const { searchParams } = new URL(request.url);
        const year = searchParams.get('year');
        const term = searchParams.get('term_or_break');
        const desk = searchParams.get('desk');

        let query = supabaseAdmin
            .from('term_desks')
            .select(` *, term_slots:term_slots (*, term_shifts:term_shifts (*) )`)
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

        const { data: desks, error } = await query;

        if (error) throw error;

        return NextResponse.json(desks || [], { status: 200 });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch desks' }, { status: 500 });
    }
}