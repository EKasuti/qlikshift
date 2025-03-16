import { config } from "@/config/config";

export const fetchStudents = async ({ isBreak }: { isBreak: boolean }) => {
    try {
        const response = await fetch(isBreak 
            ? `${config.apiUrl}/students/interim` 
            : `${config.apiUrl}/students/term`);
        return response.json();
    }
    catch (error) {
        console.error(error);
    }
}

export const fetchSingleStudent = async ({ isBreak, studentId }: { isBreak: boolean, studentId: string }) => {
    try {
        const response = await fetch(isBreak
            ? `${config.apiUrl}/students/interim/${studentId}`
            : `${config.apiUrl}/students/term/${studentId}`);
        return response.json();
    }
    catch (error) {
        console.error(error);
    }        
}