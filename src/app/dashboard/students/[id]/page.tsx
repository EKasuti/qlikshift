"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InterimStudent, TermStudent } from "@/types"

const timeSlots = [
    "08:00:00 - 10:00:00",
    "10:00:00 - 12:00:00",
    "12:00:00 - 14:00:00",
    "14:00:00 - 16:00:00",
    "16:00:00 - 18:00:00",
    "18:00:00 - 20:00:00",
    "20:00:00 - 22:00:00",
    "22:00:00 - 00:00:00",
]

const interimHours = [
    "08:00:00 - 10:00:00",
    "10:00:00 - 12:00:00",
    "12:00:00 - 14:00:00",
    "14:00:00 - 16:00:00",
    "16:00:00 - 18:00:00",
    "18:00:00 - 20:00:00",
]

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Function to format the date
const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Full date format
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Extract short weekday (3chars)
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

    return `${formattedDate} (${dayOfWeek})`; 
}

// Define colors for each desk
const deskColors: Record<string, string> = {
    jmc: "bg-blue-200",
    baker: "bg-green-200",
    circ: "bg-yellow-200",
    orozco: "bg-red-200",
}

export default function StudentDetailsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id as string
    const selectedTerm = searchParams.get('selectedTerm') || ''
    const selectedYear = searchParams.get('selectedYear') || ''
    const isInterimStudent = selectedTerm.endsWith("Break")
    const [student, setStudent] = useState<TermStudent | InterimStudent | null>(null)
    const [loading, setLoading] = useState(true)

    // Use effect to get student details
    useEffect(() => {
        if (id) {
        const fetchStudent = async () => {
            const response = isInterimStudent ? await fetch(`/api/students/interim/${id}`) : await fetch(`/api/students/term/${id}`)
            
            const data = await response.json()
            setStudent(response.ok ? data : null)
            setLoading(false)
        }
        fetchStudent()
        }
    }, [id, selectedTerm, isInterimStudent])

    // Function to get consolidated availability
    const getConsolidatedAvailability = () => {
        if (!student || !('interim_student_availability_slots' in student)) return []
        
        const uniqueDates = [...new Set(student.interim_student_availability_slots.map(slot => slot.date))]
        return uniqueDates.map(date => {
            const slotsForDate = student.interim_student_availability_slots.filter(slot => slot.date === date)
            return {
                date,
                slots: interimHours.map(hour => {
                    const matchingSlot = slotsForDate.find(slot => slot.time_slot === hour)
                    return matchingSlot?.scheduled_status || null
                })
            }
        })
    }

    if (loading) return <p>Loading...</p>
    if (!student) return <p>Student not found.</p>

    return (
        <div className="mx-auto space-y-6">
            {/* Button to return to all students */}
            <div>
                <Button className="bg-white text-black hover:text-white hover:bg-primary" onClick={() => window.history.back()}>
                    Back to All Students
                </Button>
            </div>
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex gap-6">
                        {/* Avatar */}
                        <Avatar className="h-24 w-24 bg-primary flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                                {student.preferred_name.split(" ").map(name => name.charAt(0)).join("")}
                            </span>
                        </Avatar>

                        {/* Student's details */}
                        <div className="space-y-2">
                            <div>
                                <span className="font-bold text-xl">{student.preferred_name} ({student.issub ? "Sub" : (student.isworking ? "Working" : "Not Working")}) </span>
                            </div>
                            <div className="flex justify-between">
                                <div>
                                    <div>
                                        <span className="font-semibold">Email: </span><span>{student.email}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Desks: </span><span>{student.jobs}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Seniority: </span><span>{student.seniority}</span>
                                    </div>
                                </div>
                                <div className="ml-8">
                                    <div>
                                        <span className="font-semibold">Consecutive hours: </span><span>{student.preferred_hours_in_a_row}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Hrs/Wk: </span><span>{student.preferred_hours_per_week}</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold">Max Shifts: </span><span>{student.max_shifts}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div>
                    <h2 className="text-lg font-semibold text-center">
                        {student.preferred_name}&apos;s Availability for {selectedTerm} {selectedYear}
                    </h2>

                    <div className="mb-4">
                        <span className="font-semibold">Assigned Shifts: </span>
                        <span>{student.assigned_shifts}</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {/* TERM STUDENTS */}
                    {selectedTerm.endsWith("Term") ? (
                        <table className="w-full border-collapse">
                            {/* Table head */}
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="p-2 rounded-tl-lg bg-primary text-white">Time/Day</th>
                                    {days.map((day, index) => (
                                        <th key={day} className={`border-l px-4 py-2 font-semibold ${index === days.length - 1 ? 'rounded-tr-lg' : ''}`}>
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Table body */}
                            <tbody>
                                {timeSlots.map((time, index) => (
                                <tr key={time} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                    <td className="border px-4 py-2 font-semibold">{time}</td>
                                        {days.map((day) => {
                                            const availability = (student as TermStudent).term_student_availability_slots?.find(slot => slot.day_of_week === day && slot.time_slot === time)
                                            return (
                                                <td key={`${day}-${time}`} className={`border px-4 py-2 text-center ${availability ? deskColors[availability.scheduled_status.toLowerCase()] : ""}`}>
                                                    {availability ? <span>{availability.scheduled_status}</span> : "Not found"}
                                                </td>
                                            )
                                        }
                                    )}
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        // INTERIM STUDENTS
                        <table className="w-full border-collapse">
                            {/* Table Head */}
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="p-2 rounded-tl-lg bg-primary text-white">Date/Time</th>
                                    {interimHours.map((hour, index) => (
                                        <th key={hour} className={`border-l px-2 py-2 font-semibold ${index === interimHours.length - 1 ? 'rounded-tr-lg' : ''}`}>
                                            {hour}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {getConsolidatedAvailability().map((availability, index) => (
                                    <tr key={availability.date} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="border px-4 py-2 font-semibold text-center">{formatDate(availability.date)}</td>
                                        {availability.slots.map((status, index) => {
                                            const colorClass = status ? deskColors[status.toLowerCase()] : "";
                                            return (
                                                <td key={`${availability.date}-${index}`} className={`border px-4 py-2 text-center ${colorClass}`}>
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
            </Card>
        </div>
    )
}