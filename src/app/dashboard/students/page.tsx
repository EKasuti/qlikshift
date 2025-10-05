"use client";

import { useState } from "react";
import { StatCardData, StatsCards } from "@/components/dashboard/stats-cards";
import { useStudentsData } from "@/hooks/students";
import { StudentsFilters } from "./components/studentsFIlters";
import { StudentsTable } from "./components/studentTable";
import { Calendar, UserCheck, Users } from "lucide-react";


export default function StudentsPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedTerm, setSelectedTerm] = useState("Fall Term");
  const [sortField, setSortField] = useState("seniority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<"all" | "sub" | "working" | "notWorking">("all");

  const { students, fetching } = useStudentsData(selectedYear, selectedTerm);

  const filteredStudents = students.filter((s) => {
    if (filter === "sub") return s.isSub && s.isWorking;
    if (filter === "working") return s.isWorking && !s.isSub;
    if (filter === "notWorking") return !s.isWorking;
    return true;
  });

  const sorted = [...filteredStudents].sort((a, b) => {
    if (sortField === "preferred_name") {
      return sortOrder === "asc"
        ? a.preferred_name.localeCompare(b.preferred_name)
        : b.preferred_name.localeCompare(a.preferred_name);
    }
    if (sortField === "seniority") {
      return sortOrder === "asc" ? a.seniority - b.seniority : b.seniority - a.seniority;
    }
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const totalStudents = filteredStudents.length;
  const averageHoursPerWeek = totalStudents > 0 
    ? parseFloat((filteredStudents.reduce((sum, student) => sum + student.preferred_hours_per_week, 0) / totalStudents).toFixed(1)) 
    : 0;
  const assignedStudents = filteredStudents.filter(student => student.assigned_shifts > 0).length;

  const statsData: StatCardData[] = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "purple" },
    { title: "Hrs/Week", value: averageHoursPerWeek, icon: Calendar, color: "blue" },
    { title: "Unassigned Students", value: totalStudents - assignedStudents, icon: Users, color: "orange" },
    { title: "Assigned Students", value: assignedStudents, icon: UserCheck, color: "green" }
  ];

  return (
    <div className="flex flex-col gap-4">
      <StudentsFilters
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedTerm={selectedTerm}
        setSelectedTerm={setSelectedTerm}
        filter={filter}
        setFilter={setFilter}
      />

      <StatsCards stats={statsData}/>

      {fetching ? (
        <p>Loading students...</p>
      ) : (
        <StudentsTable
          students={sorted}
          selectedYear={selectedYear}
          selectedTerm={selectedTerm}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort} />
      )}
    </div>
  );
}
