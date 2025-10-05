import { config } from "@/config/config";

const getAuthHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  
  if (!token) throw new Error("No authentication token found");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// Fetch Term Students
export const fetchTermStudents = async ({ year, term_or_break }: { year: number, term_or_break: string }) => {
  try {
    const response = await fetch( `${config.apiUrl}/students/term?year=${year}&term_or_break=${term_or_break}`,
      {
        headers:  getAuthHeaders(),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch term students");

    return response.json();
  } catch (error) {
    console.error(error);
  }
}

// Fetch Single Term Student
export const fetchSingleTermStudent = async (studentId: string) => {
  try {
    const response = await fetch(`${config.apiUrl}/students/term/${studentId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch term student");

    return response.json();
  } catch (error) {
    console.error(error);
  }
};

// Fetch Interim Students
export const fetchInterimStudents = async ({ year, term_or_break }: { year: number, term_or_break: string }) => {
  try {
    const response = await fetch( `${config.apiUrl}/students/interim?year=${year}&term_or_break=${term_or_break}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch interim students");

    return response.json();
  }
  catch (error) {
    console.error(error);
  }
}

// Fetch Single Interim Student
export const fetchSingleInterimStudent = async (studentId: string) => {
  try {
    const response = await fetch(`${config.apiUrl}/students/interim/${studentId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch interim student");

    return response.json();
  } catch (error) {
    console.error(error);
  }
}

// Handle Term Students upload
export const handleTermStudentsUpload = async ({
  file,
  year,
  term_or_break,
} : {
  file: File;
  year: string;
  term_or_break: string;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("year", year);
  formData.append("term_or_break", term_or_break);

  const response = await fetch(`${config.apiUrl}/students/term`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upload term students: ${text}`);
  }

  return response.json();
};

// Handle Interim Students upload
export const handleInterimStudentsUpload = async ({
  file,
  year,
  term_or_break,
}: {
  file: File;
  year: string;
  term_or_break: string;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("year", year);
  formData.append("term_or_break", term_or_break);

  const response = await fetch(`${config.apiUrl}/students/interim`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to upload interim students: ${text}`);
  }

  return response.json();
};


// TODO : DEPRECATE
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