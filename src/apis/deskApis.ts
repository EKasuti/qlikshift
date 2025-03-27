import { config } from "@/config/config";
import { InterimShift, TermPayload, TermShift } from "@/types/deskType";

// Fetching desk data
export const fetchDesk = async ({ isBreak, selectedYear, selectedTerm, selectedDesk }: { isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string }) => {
    try {
        const response = await fetch(isBreak 
            ? `${config.apiUrl}/desks/interim?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}` 
            : `${config.apiUrl}/desks/term?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`);
        return response.json();
    }
    catch (error) {
        console.error(error);
    }
}

// Create desk
export const createTermDesk = async ({ payload} : { payload: TermPayload }) => {
    try {
        const response = await fetch(`${config.apiUrl}/desks/term`, {
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

type Shift = TermShift | InterimShift

// Getting available students
export const fetchAvailableStudents = async ({ isBreak, shift, selectedTerm, selectedDesk }: { isBreak: boolean, shift: Shift, selectedYear: string, selectedTerm: string, selectedDesk: string }) => {
    try {
        const response = await fetch(isBreak 
            ? `${config.apiUrl}/desks/interim/availableStudents?shiftId=${shift.id}&termOrBreak=${selectedTerm}&desk=${selectedDesk}` 
            : `${config.apiUrl}/desks/term/availableStudents?shiftId=${shift.id}&termOrBreak=${selectedTerm}&desk=${selectedDesk}`);

        return response.json();
    }
    catch (error) {
        console.error(error);
    }
}

// Exporting Desks
export const exportDesk = async ({ isBreak, selectedYear, selectedTerm, selectedDesk }: { isBreak: boolean, selectedYear: string, selectedTerm: string, selectedDesk: string }) => {
    try {
        const response = await fetch(isBreak 
            ? `${config.apiUrl}/desks/interim/export?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}` 
            : `${config.apiUrl}/desks/term/export?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`,
            {
                headers: {
                    'Accept': 'application/octet-stream'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Export failed with status ${response.status}`);
        }
        
        // Get filename from Content-Disposition header or generate one
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition 
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `${selectedDesk}_${selectedTerm}_${selectedYear}_export.xlsx`;

        // Return both blob and filename
        return {
           blob: await response.blob(),
           fileName
        };
    }
    catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}