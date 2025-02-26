// ---------------- USER ---------------- //
export interface User {
  id: string
  email: string
  username: string | null
  created_at: string
  role?: string
  email_confirmed_at?: string
  last_sign_in_at?: string
} 

// ---------------- STUDENTS ---------------- //

// General student
export interface Student {
  id: number;
  preferred_name: string;
  email: string;
  jobs: string;
  preferred_desk: string;
  preferred_hours_per_week: number;
  preferred_hours_in_a_row: number;
  seniority: string;
  assigned_shifts: number;
  max_shifts: number;
  year: string;
  termOrBreak: string;
}

// Term Student
export interface TermStudent {
  preferred_name: string
  email: string
  jobs: string
  seniority: number
  assigned_shifts: number
  term_student_availability_slots: {
    time_slot: string
    day_of_week: string
    scheduled_status: string
  }[]
}

// Interim Student
export interface InterimStudent {
  preferred_name: string
  email: string
  jobs: string
  seniority: number
  assigned_shifts: number
  interim_student_availability_slots: {
    id: string
    date: string
    time_slot: string
    scheduled_status: string
  }[]
}

// ---------------- DESKS ---------------- //

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
export interface Interim_Desk {
  id: string;
  desk_name: string;
  term_or_break: string;
  year: string;
  opening_time: string;
  closing_time: string;
  created_at: string;
  interim_slots: InterimSlot[];
}

// Available Student interface
export interface AvailableStudent {
  student_id: string;
  preferred_name: string;
  email: string;
  availability_status: string;
}
