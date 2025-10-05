import { fetchInterimStudents, fetchSingleInterimStudent, fetchSingleTermStudent, fetchTermStudents, handleStudentsUpload } from "@/apis/studentApis";
import { InterimStudent, TermStudent } from "@/types/studentType";
import { StateCreator } from "zustand";

export type Student = TermStudent | InterimStudent;

// State interface
export interface StudentsState { 
    // Term Students
    fetchingTermStudents: boolean;
    fetchingTermStudentsError: string | null;
    termStudents: TermStudent[];
    fetchTermStudents: (year: number, term: string) => Promise<void>;

    // Interim Students
    fetchingInterimStudents: boolean;
    fetchingInterimStudentsError: string | null;
    interimStudents: InterimStudent[];
    fetchInterimStudents: (year: number, term: string) => Promise<void>;

    // Fetch single term student
    fetchingSingleTermStudent: boolean;
    fetchingSingleTermStudentError: string | null;
    termStudent: TermStudent | null;
    fetchSingleTermStudent: (studentId: string) => Promise<void>;

    // Fetch single interim student
    fetchingSingleInterimStudent: boolean;
    fetchingSingleInterimStudentError: string | null;
    interimStudent: InterimStudent | null;
    fetchSingleInterimStudent: (studentId: string) => Promise<void>;

    // Uploading Students
    uploadingStudents: boolean;
    uploadingStudentsError: string | null;
    uploadStudents: (isBreak: boolean, file: File, year: string, term_or_break: string) => Promise<void>;
}

export const StudentsSlice: StateCreator<StudentsState> = (set) => {
    return {
        // Term Students
        fetchingTermStudents: false,
        fetchingTermStudentsError: null,
        termStudents: [],

        // Interim Students
        fetchingInterimStudents: false,
        fetchingInterimStudentsError: null,
        interimStudents: [],

        // Single term student
        fetchingSingleTermStudent: false,
        fetchingSingleTermStudentError: null,
        termStudent: null,

        // Single interim student
        fetchingSingleInterimStudent: false,
        fetchingSingleInterimStudentError: null,
        interimStudent: null,
        
        // Uploading students
        uploadingStudents: false,
        uploadingStudentsError: null,

        // Fetch Term Students
        fetchTermStudents: async (year: number, term: string) => {
            try {
                set({ fetchingTermStudents: true, fetchingTermStudentsError: null });
                const response = await fetchTermStudents({ year, term_or_break: term });
                
                set((state) => ({
                    ...state,
                    termStudents: response,
                    fetchingTermStudents: false
                }));
            } catch (error) {
                console.error(`Couldn't fetch term students. ${error}`);
                set((state) => ({
                    ...state,
                    termStudents: [],
                    fetchingTermStudents: false,
                    fetchingTermStudentsError: error instanceof Error ? error.message : 'Failed to fetch term students'
                }));
            }  
        },

        // Fetch Interim Students
        fetchInterimStudents: async (year: number, term: string) => {
            try {
                set({ fetchingInterimStudents: true, fetchingInterimStudentsError: null });
                const response = await fetchInterimStudents({ year, term_or_break: term });

                set((state) => ({
                    ...state,
                    interimStudents: response,
                    fetchingInterimStudents: false
                }));
            } catch (error) {
                console.error(`Couldn't fetch interim students. ${error}`);
                set((state) => ({
                    ...state,
                    interimStudents: [],
                    fetchingInterimStudents: false,
                    fetchingInterimStudentsError: error instanceof Error ? error.message : 'Failed to fetch interim students'
                }));
            }  
        },

        // Fetch single term student
        fetchSingleTermStudent: async (studentId) => {
            try {
              set({ fetchingSingleTermStudent: true, fetchingSingleTermStudentError: null });
              const data = await fetchSingleTermStudent(studentId);

              set({
                termStudent: data,
                fetchingSingleTermStudent: false,
              });
            } catch (error) {
              console.error("Couldn't fetch single term student:", error);
              set({
                termStudent: null,
                fetchingSingleTermStudent: false,
                fetchingSingleTermStudentError:
                  error instanceof Error ? error.message : "Failed to fetch term student",
              });
            }
        },

        // Fetch single interim student
        fetchSingleInterimStudent: async (studentId) => {
            try {
              set({ fetchingSingleInterimStudent: true, fetchingSingleInterimStudentError: null });
              const data = await fetchSingleInterimStudent(studentId);
              set({
                interimStudent: data,
                fetchingSingleInterimStudent: false,
              });
            } catch (error) {
              console.error("Couldn't fetch single interim student:", error);
              set({
                interimStudent: null,
                fetchingSingleInterimStudent: false,
                fetchingSingleInterimStudentError:
                  error instanceof Error ? error.message : "Failed to fetch interim student",
              });
            }
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

                // await get().fetchStudents(isBreak);

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