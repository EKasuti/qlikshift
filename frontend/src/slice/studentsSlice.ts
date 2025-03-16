import { fetchSingleStudent, fetchStudents } from "@/apis/studentsApi";
import { InterimStudent, TermStudent } from "@/types/studentType";
import { StateCreator } from "zustand";

export type Student = TermStudent | InterimStudent;

// State interface
export interface StudentsState {
    students: Student[];
    student: Student | null;
    loading: boolean;
    error: string | null;
    fetchStudents: (isBreak: boolean) => Promise<void>;
    fetchSingleStudent: (isBreak: boolean, studentId: string) => Promise<void>;
    getTermStudents: (year: number, term: string) => Student[];
    getInterimStudents: (year: number, term: string) => Student[];
}

export const StudentsSlice: StateCreator<StudentsState> = (set, get) => {
    return {
        students: [],
        student: null,
        loading: false,
        error: null,

        fetchStudents: async (isBreak: boolean) => {
            try {
                set({ loading: true, error: null });
                const response = await fetchStudents({ isBreak });
                
                set((state) => ({
                    ...state,
                    students: response,
                    loading: false
                }));
            } catch (error) {
                console.error(`Couldn't fetch students. ${error}`);
                set((state) => ({
                    ...state,
                    students: [],
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch students'
                }));
            }
        },

        // Fetch a single student
        fetchSingleStudent: async (isBreak: boolean, studentId: string) => {
            try {
                set({ loading: true, error: null });
                const response = await fetchSingleStudent({ isBreak, studentId });
            
                set((state) => ({
                    ...state,
                    student: response,
                    loading: false
                }));
               
            } catch (error) {
                console.error(`Couldn't fetch single student. ${error}`);
                set((state) => ({
                    ...state,
                    student: null,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch single student'
                }));
            }
        },

        // Selector to get term students for a specific year and term
        getTermStudents: (year: number, term: string) => {
            return get().students.filter(student => 
                student.year === year && 
                student.term_or_break === term && 
                'term_student_availability_slots' in student
            ) as TermStudent[];
        },

        // Selector to get interim students for a specific year and term
        getInterimStudents: (year: number, term: string) => {
            return get().students.filter(student => 
                student.year === year && 
                student.term_or_break === term && 
                'interim_student_availability_slots' in student
            ) as InterimStudent[];
        }
    };
};