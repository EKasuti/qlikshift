import { assignShift, fetchAssignments } from "@/apis/assignApis";
import { AssignmentData, AssignmentPayload } from "@/types/assignmentType";
import { StateCreator } from "zustand";

// Assign Shift interface
export interface AssignmentState {
    // Fetching Assignments
    fetchingAssignments: boolean;
    fetchingAssignmentsError: string | null;
    assignments: AssignmentData[];
    handleFetchAssignments: (isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string) => Promise<void>;

    // Assigning Shifts
    assigningShifts: boolean;
    assigningShiftError: string | null;
    handleAssignShift: (isBreak: boolean, payload: AssignmentPayload) => Promise<void>;
}

export const AssignmentSlice: StateCreator<AssignmentState> = (set, get) => {
    return {
        // Fetching Assignments
        fetchingAssignments: false,
        fetchingAssignmentsError: null,
        assignments: [],

        // Assigning Shifts
        assigningShifts: false,
        assigningShiftError: null,

        // Fetching Assignments
        handleFetchAssignments: async (isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string) => {
            try {
                set({ fetchingAssignments: true, fetchingAssignmentsError: null });
                const response = await fetchAssignments({isBreak, selectedYear, selectedTerm, selectedDesk });

                if (response.error) {
                    set({ fetchingAssignments: false, fetchingAssignmentsError: response.error });
                    return;
                }

                set((state) => ({
                    ...state,
                    assignments: response,
                    fetchingAssignments: false
                }));
            }
            catch (error) {
                set({ fetchingAssignments: false, fetchingAssignmentsError: String(error) });
            }
        },

        // Assigning Shifts
        handleAssignShift: async (isBreak: boolean, payload: AssignmentPayload) => {
            try {
                set({ assigningShifts: true, assigningShiftError: null });
                const response = await assignShift({isBreak, payload });

                if (response.error) {
                    set({ assigningShifts: false, assigningShiftError: response.error });
                    return;
                }

                // Fetch assignments after assigning shift
                await get().handleFetchAssignments(isBreak, payload.year, payload.term_or_break, payload.desk_name);

                set((state) => ({
                    ...state,
                    assigningShifts: false
                }));
            }
            catch (error) {
                set({ assigningShifts: false, assigningShiftError: String(error) });
            }
        }
    }
}