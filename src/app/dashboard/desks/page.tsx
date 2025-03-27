"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Users, UserCheck, Calendar, GraduationCap, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { StatsCards, type StatCardData } from "@/components/dashboard/stats-cards"
import { AvailableStudent, Interim_Desk, InterimShift, TermDesk, TermShift } from "@/types"
import { Card } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { bakerPayload, circPayload, jmcPayload, orozcoPayload } from "@/lib/payload"

const interim_timeSlots = [
    "08:00:00 - 10:00:00",
    "10:00:00 - 12:00:00",
    "12:00:00 - 14:00:00",
    "14:00:00 - 16:00:00",
    "16:00:00 - 18:00:00",
    "18:00:00 - 20:00:00",
]

// Function to generate time slots
function generateTimeSlots(openingTime: string, closingTime: string) {
    const slots: string[] = [];
    const start = new Date(`2000-01-01T${openingTime}`);
    const end = new Date(`2000-01-01T${closingTime}`);
    
    while (start < end) {
        const slotEnd = new Date(start);
        slotEnd.setHours(slotEnd.getHours() + 2);
        
        // If slot would exceed closing time, adjust for final slot
        if (slotEnd > end) {
        slots.push(`${start.toTimeString().slice(0, 8)} - ${end.toTimeString().slice(0, 8)}`);
        break;
        }
        
        slots.push(`${start.toTimeString().slice(0, 8)} - ${slotEnd.toTimeString().slice(0, 8)}`);
        start.setHours(start.getHours() + 2);
    }
    
    return slots;
}

// Function to format Date
const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Get the full date format
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    
    // Extract the short weekday
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

    return `${formattedDate} (${dayOfWeek})`; 
}

// Modal Component
const Modal = ({ isOpen, onClose, title, date, status, availableStudents }: { isOpen: boolean; onClose: () => void; title: string; date: string; status: string; availableStudents: AvailableStudent[]; }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg mb-2">
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="text-start">{date}</p> {/* Display day or date */}
                <p className="text-start">Current Status: {status}</p>

                <h2 className="text-md font-bold">Available Students</h2>

                <h2 className="text-md font-bold text-start">First Choice</h2>
                <ul className="mb-2 text-start">
                    {availableStudents.filter(student => student.availability_status === '1st Choice').length > 0 ? (
                        availableStudents.filter(student => student.availability_status === '1st Choice').map(student => (
                        <li key={`${student.student_id}-1st Choice`}>
                            {student.preferred_name} - {student.email}
                        </li>
                        ))
                    ) : (
                        <li className="text-start">No students available for First Choice.</li>
                    )}
                </ul>

                <h2 className="text-md font-bold text-start">Second Choice</h2>
                <ul className="text-start">
                    {availableStudents.filter(student => student.availability_status === '2nd Choice').length > 0 ? (
                        availableStudents.filter(student => student.availability_status === '2nd Choice').map(student => (
                        <li key={`${student.student_id}-2nd Choice`}>
                            {student.preferred_name} - {student.email}
                        </li>
                        ))
                    ) : (
                        <li>No students available for Second Choice.</li>
                    )}
                </ul>
                <button onClick={onClose} className="mt-4 bg-primary text-white px-4 py-2 rounded">Close</button>
            </div>
        </div>
    );
};

function ScheduleTable({ desk, isBreakTerm, selectedDesk, selectedTerm, selectedYear }: { desk: TermDesk | Interim_Desk, isBreakTerm: boolean, selectedDesk: string, selectedTerm: string, selectedYear: number }) {
    const timeSlots = generateTimeSlots(desk.opening_time, desk.closing_time);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDetails, setModalDetails] = useState<{ title: string; date: string; status: string; term: string; year: number } | null>(null);
    const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);

    const handleSlotClick = async (shift: InterimShift | TermShift | undefined, dateOrDay: string, isTerm: boolean) => {
        if (shift) {
            try {
                // Determine the API endpoint based on whether the term is a "Break" term
                const endpoint = selectedTerm.endsWith("Break")
                    ? `/api/desks/interim/availableStudents?shiftId=${shift.id}&termOrBreak=${selectedTerm}&desk=${selectedDesk}`
                    : `/api/desks/term/availableStudents?shiftId=${shift.id}&termOrBreak=${selectedTerm}&desk=${selectedDesk}`;
    
                const response = await fetch(endpoint);
                if (!response.ok) {
                    throw new Error('Failed to fetch available students');
                }
    
                const data = await response.json();
    
                // Ensure the response has the expected structure
                if (!data.firstChoice || !data.secondChoice) {
                    throw new Error('Invalid response structure');
                }
    
                setModalDetails({
                    title: `${selectedDesk.toUpperCase()} Shift Details`,
                    date: isTerm ? `Day: ${dateOrDay}` : `Date: ${formatDate(dateOrDay)}`, // Pass day if Term, else date
                    status: shift.students_detailed.length > 0 
                        ? `(${shift.students_detailed.join(', ')})` 
                        : 'Closed',
                    term: selectedTerm,
                    year: selectedYear
                });
    
                setIsModalOpen(true);
    
                // Combine firstChoice and secondChoice arrays
                const combinedStudents = [...data.firstChoice, ...data.secondChoice];
                setAvailableStudents(combinedStudents);
            } catch (error) {
                console.error('Error fetching available students:', error);
                // Optionally, show an error message to the user
            }
        }
    };
    return (
        <div className="overflow-x-auto rounded-lg">
            <Card className="p-6">
            <p className="text-center mb-2 font-bold text-lg"> {selectedDesk.toUpperCase()} desk calendar for {selectedTerm} {selectedYear} </p>
                {isBreakTerm ? (
                    // Interim Desk Table
                    <table className="w-full border-collapse">
                        {/* Table Head */}
                        <thead>
                            <tr>
                                <th className="p-2 bg-primary text-white rounded-tl-lg">Date/ Time</th>
                                {interim_timeSlots.map((timeslot, index) => (
                                    <th key={timeslot} className={`border-r border-t px-2 py-2 font-semibold bg-[#F5F5F5] ${index === interim_timeSlots.length - 1 ? ' rounded-tr-lg' : ''}`}>{timeslot}</th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                            {desk && (desk as Interim_Desk).interim_slots ? (
                                (desk as Interim_Desk).interim_slots
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort interim slots by date
                                    .map((slot, index) => (
                                    <tr key={slot.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="border p-2 font-bold">{formatDate(slot.date)}</td>
                                        {interim_timeSlots.map(timeslot => {
                                            const shift = slot.interim_shifts.find(shift => 
                                                `${shift.start_time} - ${shift.end_time}` === timeslot
                                            );
                                            return (
                                                <td 
                                                    key={timeslot} 
                                                    className="border p-2 cursor-pointer" 
                                                    onClick={() => handleSlotClick(shift, slot.date, false)}
                                                >
                                                    {shift ? shift.students_detailed.join(', ') : 'Closed'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={interim_timeSlots.length + 1} className="text-center">No interim slots available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    // Term Desk Table
                    <table className="w-full border-collapse">
                        {/* Table head */}
                        <thead>
                            <tr>
                                <th className="p-2 bg-primary text-white rounded-tl-lg">Time/ Day</th>
                                    {days.map((day, index) => (
                                    <th key={day} className={`border-r border-t px-2 py-2 font-semibold bg-[#F5F5F5] ${index === days.length-1 ? 'rounded-tr-lg border' : ''}`}>{day}</th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                        {timeSlots.map((timeSlot, index) => (
                            <tr key={timeSlot} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                <td className="border p-2">{timeSlot}</td>
                                {days.map(day => {
                                    const termSlot = 'term_slots' in desk 
                                        ? desk.term_slots.find(slot => slot.day_of_week.toLowerCase() === day.toLowerCase()) 
                                        : null;

                                        const shift = termSlot?.term_shifts.find(s => 
                                        `${s.start_time} - ${s.end_time}` === timeSlot
                                        );
                                    
                                    return (
                                    <td 
                                        key={day} 
                                        className="border p-2 text-center"
                                        onClick={() => handleSlotClick(shift, day, true)}
                                    >
                                        {termSlot?.is_open && shift ? (shift.students_detailed.join(', ')) : ( 'Closed' )}
                                    </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </Card>
        
            {/* Modal for displaying slot details */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={modalDetails?.title || ''} 
                date={modalDetails?.date || ''} 
                status={modalDetails?.status || ''} 
                availableStudents={availableStudents}
            />
        </div>
    );
}

export default function DesksPage() {
    const [desks, setDesks] = useState<TermDesk | Interim_Desk[]>([])
    const [selectedYear, setSelectedYear] = useState<number>(2025)
    const [selectedTerm, setSelectedTerm] = useState<string>("Spring Term")
    const [selectedDesk, setSelectedDesk] = useState<string>("jmc")
    const isInterim = selectedTerm.endsWith("Break")
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
    const [isCreatingDesk, setIsCreatingDesk] = useState(false);

    const fetchDesks = useCallback(async () => {
        const response = await fetch(
            isInterim 
                ? `/api/desks/interim?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}` 
                : `/api/desks/term?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`
        );
        if (!response.ok) {
            console.error('Error fetching desks');
            return;
        }
        const data = await response.json();
        setDesks(data);
    }, [selectedYear, selectedTerm, selectedDesk, isInterim]);

    useEffect(() => {
        fetchDesks()
    }, [fetchDesks])

    // Function to handle creating desk
    const handleCreateDesk = async () => {
        setIsCreatingDesk(true);

        let payload

        switch (selectedDesk) {
            case "jmc":
                payload = {... jmcPayload, term_or_break: selectedTerm, year: selectedYear.toString()}
                break;
            case "circ":
                payload = {... circPayload, term_or_break: selectedTerm, year: selectedYear.toString()}
                break;
            case "baker":
                payload = {... bakerPayload, term_or_break: selectedTerm, year: selectedYear.toString()}
                break;
            case "orozco":
                payload = { ... orozcoPayload, term_or_break: selectedTerm, year: selectedYear.toString()}
                break;
            default:
                throw new Error('Invalid desk selected'); 
        }

        try {
            const response = await fetch(isInterim ? `/api/desks/interim` : `/api/desks/term`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Failed to create desk');
            }

            // Refresh the desk data
            await fetchDesks();
        } catch (error){
            console.error('Create desk error:', error);
        } finally {
            setIsCreatingDesk(false);
        }
    }
    const handleExportDesk = async () => {
        try {
            const response = await fetch(
                isInterim 
                ? `/api/desks/interim/export?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}` 
                : `/api/desks/term/export?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`
            );

            if (!response.ok) {
                throw new Error('Failed to export desk');
            }

            // Get the file name from the Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            const fileName = contentDisposition 
                ? contentDisposition.split('filename=')[1].replace(/"/g, '')
                : `${selectedDesk}_${selectedTerm}_${selectedYear}_export.csv`;

            // Download the file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            // Close the dialog
            setIsExportDialogOpen(false);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    const statsData: StatCardData[] = [
        { title: "Total Shifts", value: 0, icon: Calendar, color: "purple" },
        { title: "Available Shifts", value: 0, icon: UserCheck, color: "blue" },
        { title: "Assigned Shifts", value: 0, icon: Users, color: "orange" },
        { title: "Assigned Students", value: 0, icon: GraduationCap, color: "green" }
    ]
  
    return (
        <div className="flex flex-col gap-2">
            {/* Header tabs: Overview and Settings */}
            <div className="flex flex-col">
                <Tabs defaultValue="overview" className="w-fit">
                    <TabsList>
                        <Link href="/dashboard/desks">
                            <TabsTrigger 
                                value="overview" 
                                className=" data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:uppercase"
                            >
                                Overview
                            </TabsTrigger>
                        </Link>
                        <Link href="/dashboard/desks/settings">
                            <TabsTrigger 
                                value="settings"
                                className=" data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:uppercase"
                            >
                                Settings
                            </TabsTrigger>
                        </Link>
                    </TabsList>
                </Tabs>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-gray-200" />

            {/* Stats card */}
            <div className="mt-4 mb-4"> <StatsCards stats={statsData} /></div>

            {/* Desk Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Year */}
                    <Button variant="outline">{selectedYear}</Button>

                    {/* Button to decrement year */}
                    <Button 
                        variant="default" 
                        size="icon"
                        className="text-white"
                        onClick={() => setSelectedYear(prev => prev - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Button to increment year */}
                    <Button 
                        variant="outline" 
                        size="icon"
                        className="bg-[#d9d9d9]"
                        onClick={() => setSelectedYear(prev => prev + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Term options */}
                    <Select defaultValue={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="Fall Term">Fall Term</SelectItem>
                            <SelectItem value="Winter Break">Winter Break</SelectItem>
                            <SelectItem value="Winter Term">Winter Term</SelectItem>
                            <SelectItem value="Spring Break">Spring Break</SelectItem>
                            <SelectItem value="Spring Term">Spring Term</SelectItem>
                            <SelectItem value="Summer Break">Summer Break</SelectItem>
                            <SelectItem value="Summer Term">Summer Term</SelectItem>
                            <SelectItem value="Fall Break">Fall Break</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    {/* Button to Export desk */}
                    <AlertDialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                        <AlertDialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                className="text-red-500 border-red-500"
                                onClick={() => setIsExportDialogOpen(true)}
                            >
                                <Download className="mr-2 h-4 w-4" /> Export Desk
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Export Desk</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Do you want to export the {selectedDesk.toUpperCase()} desk for {selectedTerm} {selectedYear}?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleExportDesk}className="text-white">
                                    Export
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Button to Add desk */}
                    {!isInterim && 
                        <Button 
                            variant="outline" 
                            className="text-primary border-primary"
                            onClick={handleCreateDesk}
                        >
                        {isCreatingDesk ? 'Creating Desk...' : 'Create Desk'}
                    </Button>}
                </div>
            </div>

            {/* Desk tab names */}
            <Tabs defaultValue="jmc" className="w-fit mt-2 mb-2" value={selectedDesk} onValueChange={setSelectedDesk}>
                <TabsList className="bg-transparent border-none">
                    {/* Jmc Desk */}
                    <TabsTrigger 
                        value="jmc" 
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                    >
                        JMC
                    </TabsTrigger>
                    {/* Circ Desk */}
                    <TabsTrigger 
                        value="circ"
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                    >
                        Circ
                    </TabsTrigger>
                    {/* Baker Desk */}
                    <TabsTrigger 
                        value="baker"
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                    >
                        Baker
                    </TabsTrigger>
                    {/* Orozco Desk */}
                    <TabsTrigger 
                        value="orozco"
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                    >
                        Orozco
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Desk Table */}
            <div className="text-center text-muted-foreground">
                {Array.isArray(desks) && desks.length > 0 ? (
                    <>
                        <ScheduleTable desk={desks[0] as (TermDesk | Interim_Desk)} isBreakTerm={isInterim} selectedDesk={selectedDesk} selectedTerm={selectedTerm} selectedYear={selectedYear}/>
                    </>
                ) : (
                    <>
                        <p>
                        {selectedDesk.toUpperCase()} desk is not available for <span className="font-bold">{selectedTerm} {selectedYear}</span>.
                        </p>
                        {/* <p>Create the desk by clicking &quot;Create Desk&quot; button</p> */}
                    </>
                )}
            </div>
        </div>
    )
}

