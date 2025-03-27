import { createTermDesk, exportDesk, fetchAvailableStudents, fetchDesk } from "@/apis/deskApis";
import { AvailableStudent, InterimDesk, InterimShift, TermDesk, TermPayload, TermShift } from "@/types/deskType";
import { StateCreator } from "zustand";

export type Desk = TermDesk | InterimDesk;
type Shift = TermShift | InterimShift

// Term State interface
export interface DeskState {
    // Fetching desks
    fetchingDesk: boolean;
    fetchingDeskError: string | null;
    desk: Desk[];
    handleFetchDesk: (isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string) => Promise<void>;

    // Creating Term Desk
    creatingTermDesk: boolean;
    creatingTermDeskError: string | null;
    handleCreateTermDesk: (payload: TermPayload) => Promise<void>;

    // Getting available students
    fetchingAvailableStudents: boolean;
    fetchingAvailableStudentsError: string | null;
    availableStudents: AvailableStudent[];
    handleFetchAvailableStudents: (isBreak: boolean, shift: Shift, selectedYear: string, selectedTerm: string, selectedDesk: string) => Promise<void>;

    // Exporting desks
    exportingDesk: boolean;
    exportingDeskError: string | null;
    handleExportDesk: (isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string) => Promise<void>;
}

export const DeskSlice: StateCreator<DeskState> = (set, get) => {
    return {
        // Fetching desks
        fetchingDesk: false,
        fetchingDeskError: null,
        desk: [], 

        // Creating Term Desk
        creatingTermDesk: false,
        creatingTermDeskError: null,

        // Getting available students
        fetchingAvailableStudents: false,
        fetchingAvailableStudentsError: null,
        availableStudents: [],

        // Exporting desks
        exportingDesk: false,
        exportingDeskError: null,
        
        // Fetching desks
        handleFetchDesk: async (isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string) => {
            try {
                set({ fetchingDesk: true, fetchingDeskError: null });
                const response = await fetchDesk({ isBreak, selectedYear, selectedTerm, selectedDesk });
                
                set((state) => ({
                    ...state,
                    desk: response,
                    fetchingDesk: false
                }));

            } catch (error) {
                console.error(`Couldn't fetch desk. ${error}`);
                set((state) => ({
                    ...state,
                    desk: [],
                    fetchingDesk: false
                }));
            }
        },
        
        // Creating Term Desk
        handleCreateTermDesk: async (payload: TermPayload) => {
            try {
                set({ creatingTermDesk: true, creatingTermDeskError: null });
                await createTermDesk({ payload });

                // call fetch desk
                await get().handleFetchDesk(false, payload.year, payload.term_or_break, payload.desk_name);
                set((state) => ({
                    ...state,
                    creatingTermDesk: false
                }));

            } catch (error) {
                console.error(`Couldn't create term desk. ${error}`);
                set({ creatingTermDesk: false, creatingTermDeskError: error instanceof Error ? error.message : 'Failed to create term desk' });
            }
        },

        // Getting available students
        handleFetchAvailableStudents: async (isBreak: boolean, shift: Shift, selectedYear: string, selectedTerm: string, selectedDesk: string) => {
            try {
                set({ fetchingAvailableStudents: true, fetchingAvailableStudentsError: null });
                const response = await fetchAvailableStudents({ isBreak, shift, selectedYear, selectedTerm, selectedDesk });
               
                // Combining firstChoice and secondChoice arrays from the response
                const combinedStudents = [
                    ...(response.firstChoice || []).map((student: AvailableStudent) => ({ 
                        ...student, 
                        availability_status: '1st Choice' 
                    })),
                    ...(response.secondChoice || []).map((student: AvailableStudent) => ({ 
                        ...student, 
                        availability_status: '2nd Choice' 
                    }))
                ];

                set((state) => ({
                    ...state,
                    availableStudents: combinedStudents,
                    fetchingAvailableStudents: false
                }));

            } catch (error) {
                console.error(`Couldn't fetch available students. ${error}`);
                set((state) => ({
                    ...state,
                    availableStudents: [],
                    fetchingAvailableStudents: false
                }));
            }
        },

        // Exporting desks
        handleExportDesk: async (isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string) => {
            try {
                set({ exportingDesk: true, exportingDeskError: null });
                const { blob, fileName }  = await exportDesk({ isBreak, selectedYear, selectedTerm, selectedDesk });
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                set({ exportingDesk: false });
            }
            catch (error) {
                console.error(`Couldn't export desk. ${error}`);
                set({ exportingDesk: false, exportingDeskError: error instanceof Error ? error.message : 'Failed to export desk' });
            }
        }
    }
}