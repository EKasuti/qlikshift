"use client";

import { TermStudent, InterimStudent } from "@/types/studentType";

const termSlots = [
  "08:00:00 - 10:00:00",
  "10:00:00 - 12:00:00",
  "12:00:00 - 14:00:00",
  "14:00:00 - 16:00:00",
  "16:00:00 - 18:00:00",
  "18:00:00 - 20:00:00",
  "20:00:00 - 22:00:00",
  "22:00:00 - 00:00:00",
];

const interimSlots = [
  "08:00:00 - 10:00:00",
  "10:00:00 - 12:00:00",
  "12:00:00 - 14:00:00",
  "14:00:00 - 16:00:00",
  "16:00:00 - 18:00:00",
  "18:00:00 - 20:00:00",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const deskColors: Record<string, string> = {
  jmc: "bg-blue-200",
  baker: "bg-green-200",
  circ: "bg-yellow-200",
  orozco: "bg-red-200",
  "not available": "bg-gray-200 text-gray-700",
  "1st choice": "bg-green-300",
  "2nd choice": "bg-yellow-300",
  "3rd choice": "bg-orange-300",
};

interface AvailabilitySlot {
  id: string;
  day_of_week: string;
  time_slot: string;
  date?: string;
  scheduled_status: string;
  availability_status?: string;
}

export function StudentAvailabilityTable({
  student,
  selectedTerm,
  selectedYear,
  isBreak,
}: {
  student: TermStudent | InterimStudent;
  selectedTerm: string;
  selectedYear: string;
  isBreak: boolean;
}) {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const availabilitySlots: AvailabilitySlot[] =
    "availability_slots" in student
      ? (student.availability_slots as AvailabilitySlot[])
      : ((student as TermStudent).term_student_availability_slots as AvailabilitySlot[]);

  /** For interim students */
  const getConsolidatedAvailability = () => {
    const withDates = availabilitySlots.filter((s) => s.date);
    const uniqueDates = [...new Set(withDates.map((s) => new Date(s.date!).toISOString().split("T")[0]))];

    return uniqueDates.map((date) => {
      const slotsForDate = withDates.filter(
        (s) => new Date(s.date!).toISOString().split("T")[0] === date
      );
      return {
        date,
        slots: interimSlots.map((hour) => {
          const match = slotsForDate.find((s) => s.time_slot === hour);
          return match?.scheduled_status || "Not found";
        }),
      };
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-center mb-2">
        {student.preferred_name}&apos;s Availability for {selectedTerm} {selectedYear}
      </h2>

      <div className="mb-4">
        <span className="font-semibold">Assigned Shifts: </span>
        <span>{student.assigned_shifts}</span>
      </div>

      <div className="overflow-x-auto">
        {/* TERM STUDENTS */}
        {!isBreak ? (
          <table className="w-full border-collapse">
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="p-2 bg-primary text-white rounded-tl-lg">Time/Day</th>
                {days.map((day, idx) => (
                  <th
                    key={day}
                    className={`border-l px-4 py-2 font-semibold ${
                      idx === days.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {termSlots.map((time, idx) => (
                <tr key={time} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-4 py-2 font-semibold">{time}</td>
                  {days.map((day) => {
                    const slot = availabilitySlots.find(
                      (s) => s.day_of_week === day && s.time_slot === time
                    );
                    const color =
                      slot && slot.scheduled_status
                        ? deskColors[slot.scheduled_status.toLowerCase()] || ""
                        : "";
                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`border px-4 py-2 text-center ${color}`}
                      >
                        {slot ? slot.scheduled_status : "Not found"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // INTERIM STUDENTS
          <table className="w-full border-collapse">
            <thead className="bg-[#F5F5F5]">
              <tr>
                <th className="p-2 bg-primary text-white rounded-tl-lg">Date/Time</th>
                {interimSlots.map((hour, idx) => (
                  <th
                    key={hour}
                    className={`border-l px-2 py-2 font-semibold ${
                      idx === interimSlots.length - 1 ? "rounded-tr-lg" : ""
                    }`}
                  >
                    {hour}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getConsolidatedAvailability().map((availability, idx) => (
                <tr key={availability.date} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border px-4 py-2 font-semibold text-center">
                    {formatDate(availability.date)}
                  </td>
                  {availability.slots.map((status, i) => {
                    const color = status ? deskColors[status.toLowerCase()] || "" : "";
                    return (
                      <td
                        key={`${availability.date}-${i}`}
                        className={`border px-4 py-2 text-center ${color}`}
                      >
                        {status}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
