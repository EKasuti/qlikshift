// ------------------------------ TERM DESK ------------------------------ //
// Term Shift Payload interface
export interface TermShiftPayload {
    start_time: string;
    end_time: string;
    max_students: number;
}
// TermSlotPayload interface
export interface TermSlotPayload {
    day_of_week: string;
    is_open: boolean;
    shifts: TermShiftPayload[];
}

// Term Payload interface
export interface TermPayload {
    desk_name: string;
    term_or_break: string;
    year: string;
    opening_time: string;
    closing_time: string;
    term_slots: TermSlotPayload[];
}


// Term Shift interface
export interface TermShift {
    id: string;
    start_time: string;
    end_time: string;
    max_students: number;
    students_detailed: [];
    created_at: string;
    term_slot_id: string;
}
  
// Term Slot interface
export interface TermSlot {
    id: string;
    desk_id: string;
    day_of_week: string;
    is_open: boolean;
    created_at: string;
    term_shifts: TermShift[];
}
  
// Term Desk interface
export interface TermDesk {
    id: string;
    desk_name: string;
    term_or_break: string;
    year: string;
    opening_time: string;
    closing_time: string;
    created_at: string;
    term_slots: TermSlot[];
}

// ------------------------------ INTERIM DESK ------------------------------ //
// Interim Shift interface
export interface InterimShift {
    id: string;
    start_time: string;
    end_time: string;
    max_students: number;
    students_detailed: [];
    created_at: string;
    interim_slot_id: string;
}
  
// Interim Slot interface
export interface InterimSlot {
    id: string;
    desk_id: string;
    date: string;
    created_at: string;
    interim_shifts: InterimShift[];
}
  
// Interim Desk interface
export interface InterimDesk {
    id: string;
    desk_name: string;
    term_or_break: string;
    year: string;
    opening_time: string;
    closing_time: string;
    created_at: string;
    interim_slots: InterimSlot[];
}

// ------------------------------ Available Students ------------------------------ //
// Available Student interface
export interface AvailableStudent {
    student_id: string;
    preferred_name: string;
    email: string;
    availability_status: string;
  }
  