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

export const handleStudentsUpload = async ({ isBreak, file, year, term_or_break }: { isBreak: boolean, file: File, year: string, term_or_break: string }) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", year.toString());
        formData.append("term_or_break", term_or_break);

        const response = await fetch(isBreak ? `${config.apiUrl}/students/interim` : `${config.apiUrl}/students/term`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Failed to upload students");
        }

        return response.json();
    } catch (error) {
        console.error(error);   
        

    }
}