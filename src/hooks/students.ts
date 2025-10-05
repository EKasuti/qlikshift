import { useCallback, useEffect } from "react";
import { useStore } from "@/utils/useStore";

export function useStudentsData(year: number, term: string) {
  const isBreak = term.endsWith("Break");

  const {
    fetchTermStudents,
    fetchInterimStudents,
    termStudents,
    interimStudents,
    fetchingTermStudents,
    fetchingInterimStudents,
  } = useStore();

  const fetchData = useCallback(() => {
    if (isBreak) {
      fetchInterimStudents(year, term);
    } else {
      fetchTermStudents(year, term);
    }
  }, [year, term, isBreak, fetchTermStudents, fetchInterimStudents]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetching = isBreak ? fetchingInterimStudents : fetchingTermStudents;
  const students = isBreak ? interimStudents : termStudents;

  return { students, fetching, isBreak };
}

export function useSingleStudent(studentId: string, term: string) {
  const isBreak = term.endsWith("Break");

  const {
    // Term
    fetchSingleTermStudent,
    termStudent,
    fetchingSingleTermStudent,
    fetchingSingleTermStudentError,

    // Interim
    fetchSingleInterimStudent,
    interimStudent,
    fetchingSingleInterimStudent,
    fetchingSingleInterimStudentError,
  } = useStore();

  useEffect(() => {
    if (!studentId) return;
    if (isBreak) {
      fetchSingleInterimStudent(studentId);
    } else {
      fetchSingleTermStudent(studentId);
    }
  }, [studentId, isBreak, fetchSingleTermStudent, fetchSingleInterimStudent]);

  const fetching = isBreak ? fetchingSingleInterimStudent : fetchingSingleTermStudent;
  const error = isBreak ? fetchingSingleInterimStudentError : fetchingSingleTermStudentError;
  const student = isBreak ? interimStudent : termStudent;

  return { student, fetching, error, isBreak };
}