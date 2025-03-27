import { config } from "@/config/config";
import { AssignmentPayload } from "@/types/assignmentType";

// Get Assignments
export const fetchAssignments = async ({ isBreak, selectedYear, selectedTerm, selectedDesk }: { isBreak:boolean, selectedYear: string, selectedTerm: string, selectedDesk: string }) => {
    try {
        const response = await fetch(isBreak 
            ? `${config.apiUrl}/assignments/interim?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}` 
            : `${config.apiUrl}/assignments/term?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`);

        return response.json();
    }
    catch (error) {
        console.error(error);
    }
}

// Assign Shift
export const assignShift = async ({isBreak, payload } : {isBreak: boolean, payload: AssignmentPayload}) => {
    try {
        const response = await fetch(isBreak ? `${config.apiUrl}/assignments/interim` : `${config.apiUrl}/assignments/term`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        return response.json();
    }
    catch (error) {
        console.error(error);
    }
}