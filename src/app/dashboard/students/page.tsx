"use client"

import { StatCardData, StatsCards } from "@/components/dashboard/stats-cards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Users, UserCheck, Calendar, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/types";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function StudentsPage() {
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedTerm, setSelectedTerm] = useState<string>("Spring Break");
    const [students, setStudents] = useState<Student[]>([]); 
    const [loading, setLoading] = useState<boolean>(false); 
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<string>('seniority');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    // New state for filter
    const [filter, setFilter] = useState<'all' | 'sub' | 'working' | 'notWorking'>('all');

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const response = selectedTerm.endsWith("Break")
                ? await fetch(`/api/students/interim?year=${selectedYear}&term_or_break=${selectedTerm}`)
                : await fetch(`/api/students/term?year=${selectedYear}&term_or_break=${selectedTerm}`);
            
            const data = await response.json();

            // Sort students based on selected field and order
            const sortedStudents = data.sort((a: Student, b: Student) => {
                const aValue = a[sortField as keyof Student]; 
                const bValue = b[sortField as keyof Student];

                let comparison = 0;
                if (aValue > bValue) {
                    comparison = 1;
                } else if (aValue < bValue) {
                    comparison = -1;
                }
                return sortOrder === 'desc' ? comparison * -1 : comparison;
            });

            setStudents(sortedStudents);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedTerm, sortOrder, sortField]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    // Calculate statistics
    const totalStudents = students.length;
    const averageHoursPerWeek = totalStudents > 0 
        ? parseFloat((students.reduce((sum, student) => sum + student.preferred_hours_per_week, 0) / totalStudents).toFixed(1)) 
        : 0;
    const assignedStudents = students.filter(student => student.assigned_shifts > 0).length;

    const statsData: StatCardData[] = [
        { title: "Total Students", value: totalStudents, icon: Users, color: "purple" },
        { title: "Hrs/Week", value: averageHoursPerWeek, icon: Calendar, color: "blue" },
        { title: "Unassigned Students", value: totalStudents - assignedStudents, icon: Users, color: "orange" },
        { title: "Assigned Students", value: assignedStudents, icon: UserCheck, color: "green" }
    ];

    // Function to filter students based on selected filter
    const filteredStudents = students.filter(student => {
        if (filter === 'sub') return student.issub && student.isworking;
        if (filter === 'working') return student.isworking && !student.issub;
        if (filter === 'notWorking') return !student.isworking;
        return true; // 'all' case
    });

    // Function to handle file change
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
            if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                setFile(selectedFile);
                setUploadError(null); // Clear any previous error
            } else {
                setUploadError("Please upload a valid Excel file (.xlsx, .xls).");
                setFile(null); // Clear the file if the type is invalid
            }
        }
    };

    // Function to handle upload
    const handleUpload = async () => {
        if (!file) return;

        setUploadLoading(true);
        setUploadError(null);
        setUploadSuccess(null);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("year", selectedYear.toString());
        formData.append("term_or_break", selectedTerm);

        const endpoint = selectedTerm.endsWith("Break")
            ? `/api/students/interim`
            : `/api/students/term`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload students");
            }

            const result = await response.json();
            setUploadSuccess(result.message);
            setFile(null);
            setIsDialogOpen(false); 

            fetchStudents()
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Unknown error");
            setFile(null);
        } finally {
            setUploadLoading(false);
        }
    };

    // Function to handle sorting
    const handleSort = (field: string) => {
        setSortField(field);
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col">
                <Tabs defaultValue="overview" className="w-fit">
                    <TabsList>
                        <Link href="/dashboard/students">
                            <TabsTrigger value="overview" 
                                className=" data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:uppercase">Overview</TabsTrigger>
                        </Link>
                        <Link href="/dashboard/students/settings">
                            <TabsTrigger value="settings"
                            className=" data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:uppercase"
                            >Settings</TabsTrigger>
                        </Link>
                    </TabsList>
                </Tabs>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-gray-200 mb-2" />

            {/* Stats Data */}
            <StatsCards stats={statsData} />

            {/* Desk Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Year */}
                    <Button variant="outline">{selectedYear}</Button>

                    

                    {/* Button to Decrement Year */}
                    <Button 
                        variant="default" 
                        size="icon"
                        className="text-white"
                        onClick={() => setSelectedYear(prev => prev - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Button to Increment Year */}
                    <Button 
                        variant="outline" 
                        size="icon"
                        className="bg-[#d9d9d9]"
                        onClick={() => setSelectedYear(prev => prev + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Terms List */}
                    <Select defaultValue={selectedTerm} onValueChange={setSelectedTerm}>
                        <SelectTrigger className="w-[180px] bg-white">
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
                    
                    {/* Filter Icon */}
                    <Button variant="outline" onClick={() => setFilter('all')}>
                        <Filter />
                    </Button>
                    <Select defaultValue={filter} onValueChange={(value: 'all' | 'sub' | 'working' | 'notWorking') => setFilter(value)}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Select filter" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="sub">Sub</SelectItem>
                            <SelectItem value="working">Working</SelectItem>
                            <SelectItem value="notWorking">Not Working</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" className="text-primary border-primary" onClick={() => setIsDialogOpen(true)}>
                    Upload File
                </Button>
            </div>

            {/* Upload Students Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setFile(null); // Reset file when dialog is closed
                }
            }}>
                <DialogContent className="bg-white">
                    <DialogTitle>Add Students</DialogTitle>
                    <DialogDescription>
                        Upload a file for {selectedTerm} {selectedYear}
                    </DialogDescription>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                    <Button 
                        variant="default" 
                        onClick={handleUpload} 
                        disabled={uploadLoading || !file}
                        className="text-white"
                    >
                        {uploadLoading ? "Uploading..." : "Upload Students"}
                    </Button>
                    {uploadError && <p className="text-red-500">{uploadError}</p>}
                    {uploadSuccess && <p className="text-green-500">{uploadSuccess}</p>}
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>

            {/* Students table data */}
            {loading ? (
                <p>Loading students...</p>
            ) : filteredStudents.length > 0 ? (
                <Card className="p-6">
                    <div className="overflow-x-auto">
                        {/* Table Title */}
                        <p className="text-center mb-2 font-bold text-lg">Students for {selectedTerm} {selectedYear}</p>
                        
                        <table className="w-full border-collapse">
                            {/* Table Head */}
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="p-2 rounded-tl-lg bg-primary text-white">Id</th>
                                    <th className="border-l p-2 text-start">Name</th>
                                    <th className="border-l p-2 text-start">Email</th>
                                    <th className="border-l p-2 text-start">Availability</th>
                                    <th className="border-l p-2 text-start">Jobs</th>
                                    <th className="border-l p-2 text-start">Preferred Desk</th>
                                    <th className="border-l p-2 text-start cursor-pointer" onClick={() => handleSort('seniority')}>
                                        Seniority 
                                        {sortField === 'seniority' && (sortOrder === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                                    </th>
                                    
                                    <th className="border-l p-2 text-start">Hrs / Wk</th>
                                    <th className="border-l p-2 text-start">Max shifts</th>
                                    <th className="border-l p-2 text-start cursor-pointer" onClick={() => handleSort('assigned_shifts')}>
                                        Shifts 
                                        {sortField === 'assigned_shifts' && (sortOrder === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                                    </th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr key={student.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="border p-2">{index + 1}</td>
                                        <td className="border p-2 text-start">
                                            <Link 
                                                href={`/dashboard/students/${student.id}?selectedTerm=${selectedTerm}&selectedYear=${selectedYear}`} 
                                                className="text-blue-600 hover:underline"
                                            >
                                                {student.preferred_name}
                                            </Link>
                                        </td>
                                        <td className="border p-2 text-start">{student.email}</td>
                                        <td className="border p-2 text-start">
                                            {student.issub ? "Sub" : (student.isworking ? "Working" : "Not Working")}
                                        </td>
                                        <td className="border p-2 text-start">{student.jobs}</td>
                                        <td className="border p-2 text-start">{student.preferred_desk}</td>
                                        <td className="border p-2 text-start">{student.seniority}</td>
                                        <td className="border p-2 text-start">{student.preferred_hours_per_week}</td>
                                        <td className="border p-2 text-start">{student.max_shifts}</td>
                                        <td className="border p-2 text-start">{student.assigned_shifts}</td>  
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <p>Students not available.</p>
            )}
        </div>
    );
}
  
  