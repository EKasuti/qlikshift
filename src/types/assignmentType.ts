export interface AssignmentData {
    id: number;
    year: string;
    term_or_break: string;
    desk_name: string;
    round_number: number;
    set_to_max_shifts: boolean;
    shifts_to_assign: number;
    consider_preferred_desk: boolean;
    log_summary: string;
    created_at: string;
}

export interface AssignmentPayload {
    desk_name: string;
    year: string;
    term_or_break: string;
    round_number: number;
    set_to_max_shifts: boolean;
    shifts_to_assign: number;
    consider_preferred_desk: boolean;
}