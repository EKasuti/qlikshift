"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TermStudent, InterimStudent } from "@/types/studentType";

type Props = {
  students: (TermStudent | InterimStudent)[];
  selectedYear: number;
  selectedTerm: string;
  sortField: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
};

export function StudentsTable({
  students,
  selectedYear,
  selectedTerm,
  sortField,
  sortOrder,
  onSort,
}: Props) {
  if (students.length === 0) return <p>No students available.</p>;

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="inline h-4 w-4 ml-1" />
    );
  };

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <p className="text-center font-bold text-lg">
          Students for {selectedTerm} {selectedYear}
        </p>
        <p className="text-center mb-2">
          (Click on headers to sort by Name, Seniority, or Shifts)
        </p>

        <table className="w-full border-collapse">
          <thead className="bg-[#F5F5F5]">
            <tr>
              <th className="p-2 rounded-tl-lg bg-primary text-white">#</th>
              <th
                className="border-l p-2 text-start cursor-pointer select-none"
                onClick={() => onSort("preferred_name")}
              >
                Name {renderSortIcon("preferred_name")}
              </th>
              <th className="border-l p-2 text-start">Email</th>
              <th className="border-l p-2 text-start">Availability</th>
              <th className="border-l p-2 text-start">Jobs</th>
              <th className="border-l p-2 text-start">Preferred Desk</th>
              <th
                className="border-l p-2 text-start cursor-pointer select-none"
                onClick={() => onSort("seniority")}
              >
                Seniority {renderSortIcon("seniority")}
              </th>
              <th className="border-l p-2 text-start">Hrs / Wk</th>
              <th className="border-l p-2 text-start">Max Shifts</th>
              <th
                className="border-l p-2 text-start cursor-pointer select-none"
                onClick={() => onSort("assigned_shifts")}
              >
                Shifts {renderSortIcon("assigned_shifts")}
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.id}
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2 text-start">
                  <Link
                    href={`/dashboard/students/${student.id}?term=${selectedTerm}&year=${selectedYear}`}
                    className="text-blue-600 hover:underline"
                  >
                    {student.preferred_name}
                  </Link>
                </td>
                <td className="border p-2 text-start">{student.email}</td>
                <td className="border p-2 text-start">
                  {
                    student.isSub ? "Sub"
                    : student.isWorking ? "Working" : "Not Working"
                  }
                </td>
                <td className="border p-2 text-start">{student.jobs}</td>
                <td className="border p-2 text-start">{student.preferred_desk}</td>
                <td className="border p-2 text-start">{student.seniority}</td>
                <td className="border p-2 text-start">
                  {student.preferred_hours_per_week}
                </td>
                <td className="border p-2 text-start">{student.max_shifts}</td>
                <td className="border p-2 text-start">
                  {student.assigned_shifts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
