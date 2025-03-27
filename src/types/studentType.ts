// General student
export interface Student {
    id: number;
    preferred_name: string;
    email: string;
    jobs: string;
    isworking: boolean;
    issub: boolean;
    preferred_desk: string;
    preferred_hours_per_week: number;
    preferred_hours_in_a_row: number;
    seniority: number;
    assigned_shifts: number;
    max_shifts: number;
    year: string;
    term_or_break: string;
}

// Term Student
export interface TermStudent {
    id: string
    preferred_name: string
    email: string
    isworking: boolean;
    issub: boolean;
    jobs: string
    seniority: number
    preferred_desk: string;
    preferred_hours_per_week: number;
    preferred_hours_in_a_row: number;
    assigned_shifts: number
    max_shifts: number;
    year: number
    term_or_break: string
    term_student_availability_slots: {
      time_slot: string
      day_of_week: string
      availability_status: string;
      scheduled_status: string
    }[]
}
  
// Interim Student
export interface InterimStudent {
    id: string
    preferred_name: string
    email: string
    isworking: boolean;
    issub: boolean;
    jobs: string
    seniority: number
    preferred_desk: string;
    preferred_hours_per_week: number;
    preferred_hours_in_a_row: number;
    assigned_shifts: number
    max_shifts: number;
    year: number
    term_or_break: string
    interim_student_availability_slots: {
      id: string
      date: string
      time_slot: string
      scheduled_status: string
    }[]
}
