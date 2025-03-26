import { fetchSingleStudent, fetchStudents, handleStudentsUpload } from "@/apis/studentsApi";
import { InterimStudent, TermStudent } from "@/types/studentType";
import { StateCreator } from "zustand";

export type Student = TermStudent | InterimStudent;

// State interface
export interface StudentsState {
    // Fetching all students
    fetchingStudents: boolean;
    fetchingStudentsError: string | null;
    students: Student[];
    fetchStudents: (isBreak: boolean) => Promise<void>;
    getTermStudents: (year: number, term: string) => Student[];
    getInterimStudents: (year: number, term: string) => Student[];

    // Fetching a single student
    fetchingSingleStudent: boolean;
    fetchingSingleStudentError: string | null;
    student: Student | null;
    fetchSingleStudent: (isBreak: boolean, studentId: string) => Promise<void>;

    // Uploading Students
    uploadingStudents: boolean;
    uploadingStudentsError: string | null;
    uploadStudents: (isBreak: boolean, file: File, year: string, term_or_break: string) => Promise<void>;
}

export const StudentsSlice: StateCreator<StudentsState> = (set, get) => {
    return {
        // Fetching all students
        fetchingStudents: false,
        fetchingStudentsError: null,
        students: [],

        // Fetching single student
        fetchingSingleStudent: false,
        fetchingSingleStudentError: null,
        student: null,
        
        // Uploading students
        uploadingStudents: false,
        uploadingStudentsError: null,

        // Fetching all students
        fetchStudents: async (isBreak: boolean) => {
            try {
                set({ fetchingStudents: true, fetchingStudentsError: null });
                const response = await fetchStudents({ isBreak });
                
                set((state) => ({
                    ...state,
                    students: response,
                    fetchingStudents: false
                }));
            } catch (error) {
                console.error(`Couldn't fetch students. ${error}`);
                set((state) => ({
                    ...state,
                    students: [],
                    fetchingStudents: false,
                    fetchingStudentsError: error instanceof Error ? error.message : 'Failed to fetch students'
                }));
            }
        },

        // Fetch a single student
        fetchSingleStudent: async (isBreak: boolean, studentId: string) => {
            try {
                set({ fetchingSingleStudent: true, fetchingSingleStudentError: null });
                const response = await fetchSingleStudent({ isBreak, studentId });
            
                set((state) => ({
                    ...state,
                    student: response,
                    fetchingSingleStudent: false
                }));
               
            } catch (error) {
                console.error(`Couldn't fetch single student. ${error}`);
                set((state) => ({
                    ...state,
                    student: null,
                    fetchingSingleStudent: false,
                    fetchingSingleStudentError: error instanceof Error ? error.message : 'Failed to fetch single student'
                }));
            }
        },

        // Selector to get term students for a specific year and term
        getTermStudents: (year: number, term: string) => {
            const students = get().students;
            const result = students.filter(student => 
                Number(student.year) === year && 
                student.term_or_break.toLowerCase() === term.toLowerCase() && 
                'term_student_availability_slots' in student
            );
            return result as TermStudent[];
        },

        // Selector to get interim students for a specific year and term
        getInterimStudents: (year: number, term: string) => {
            const students = get().students;
            return students.filter(student => 
                Number(student.year) === year && 
                student.term_or_break.toLowerCase() === term.toLowerCase() && 
                'interim_student_availability_slots' in student
            ) as InterimStudent[];
        },

        // Uploading students
        uploadStudents: async (isBreak: boolean, file: File, year: string, term_or_break: string) => {
            try {
                set({ uploadingStudents: true, uploadingStudentsError: null });
                const response = await handleStudentsUpload({ isBreak, file, year, term_or_break });
              
                if (response.error) {
                    set({
                        uploadingStudents: false,
                        uploadingStudentsError: response.error
                    });
                    return;
                }

                await get().fetchStudents(isBreak);

                set({
                    uploadingStudents: false,
                    uploadingStudentsError: null
                });
            } catch (error) {
                set({
                    uploadingStudents: false,
                    uploadingStudentsError: error instanceof Error ? error.message : 'Failed to upload students'
                });
            }
        }
    };
};