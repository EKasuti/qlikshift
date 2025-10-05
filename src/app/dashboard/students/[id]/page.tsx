"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StudentAvailabilityTable } from "../components/studentAvailabilityTable";
import { useSingleStudent } from "@/hooks/students";

export default function StudentDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const selectedTerm = searchParams.get("term") || "";
  const selectedYear = searchParams.get("year") || "";

  const {student, fetching, error, isBreak } = useSingleStudent(id, selectedTerm);

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error loading student: {error}</p>;
  if (!student) return <p>Student not found.</p>;

  return (
    <div className="mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Button
          className="bg-white text-black hover:text-white hover:bg-primary"
          onClick={() => window.history.back()}
        >
          Back to All Students
        </Button>
      </div>

      {/* Student Details */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 bg-primary flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {student.preferred_name
                  .split(" ")
                  .map((name) => name.charAt(0))
                  .join("")}
              </span>
            </Avatar>

            {/* Details */}
            <div className="space-y-2">
              <h1 className="font-bold text-xl">
                {student.preferred_name} (
                {student.isSub
                  ? "Sub"
                  : student.isWorking
                  ? "Working"
                  : "Not Working"}
                )
              </h1>

              <div className="flex justify-between">
                <div>
                  <div>
                    <span className="font-semibold">Email: </span>
                    {student.email}
                  </div>
                  <div>
                    <span className="font-semibold">Desks: </span>
                    {student.jobs}
                  </div>
                  <div>
                    <span className="font-semibold">Seniority: </span>
                    {student.seniority}
                  </div>
                </div>

                <div className="ml-8">
                  <div>
                    <span className="font-semibold">Consecutive hours: </span>
                    {student.preferred_hours_in_a_row}
                  </div>
                  <div>
                    <span className="font-semibold">Hrs/Wk: </span>
                    {student.preferred_hours_per_week}
                  </div>
                  <div>
                    <span className="font-semibold">Max Shifts: </span>
                    {student.max_shifts}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Availability Table */}
      <Card className="p-6">
        <StudentAvailabilityTable
          student={student}
          selectedTerm={selectedTerm}
          selectedYear={selectedYear}
          isBreak={isBreak}
        />
      </Card>
    </div>
  );
}
