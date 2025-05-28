"use client"

import { StatCardData, StatsCards } from "@/components/dashboard/stats-cards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Users, UserCheck, Calendar, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Filter } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/utils/useStore";

export default function StudentsPage() {
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedTerm, setSelectedTerm] = useState<string>("Summer Break");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [sortField, setSortField] = useState<string>('seniority');

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'sub' | 'working' | 'notWorking'>('all');
    const isBreak = selectedTerm.endsWith("Break");

    // Data from store
    const {
        // User
        isAdmin,
        // Fetching students
        fetchingStudents,
        fetchStudents,
        getTermStudents, getInterimStudents,

        // Uploading students
        uploadingStudents,
        uploadingStudentsError,
        uploadStudents
    } = useStore();

    const fetchData = useCallback(() => {
        fetchStudents(isBreak);

    }, [fetchStudents, isBreak]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file || !selectedYear || !selectedTerm) {
            alert('Please fill all fields');
            return;
        }

        try {
            await uploadStudents(isBreak, file, selectedYear.toString(), selectedTerm);
            
            // Reset form after successful upload if needed
            if (!uploadingStudentsError) {
                setIsDialogOpen(false);
                setFile(null);
                setUploadError(null);
                // Refresh the students list
                fetchData();
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError(uploadingStudentsError || "Failed to upload students");
        }
    };

    // Function to handle sorting
    const handleSort = (field: string) => {
        setSortField(field);
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    // Get students based on selected year and term
    const displayStudents = isBreak
        ? getInterimStudents(selectedYear, selectedTerm)
        : getTermStudents(selectedYear, selectedTerm);

    // Function to filter students based on selected filter
    const filteredStudents = displayStudents.filter(student => {
        if (filter === 'sub') return student.issub && student.isworking;
        if (filter === 'working') return student.isworking && !student.issub;
        if (filter === 'notWorking') return !student.isworking;
        return true; // 'all' case
    });

    // Sort the students based on the selected field and order
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortField === 'preferred_name') {
            return sortOrder === 'asc' 
                ? a.preferred_name.localeCompare(b.preferred_name)
                : b.preferred_name.localeCompare(a.preferred_name);
        } else if (sortField === 'seniority') {
            return sortOrder === 'asc' 
                ? a.seniority - b.seniority
                : b.seniority - a.seniority;
        } else if (sortField === 'assigned_shifts') {
            return sortOrder === 'asc' 
                ? a.assigned_shifts - b.assigned_shifts
                : b.assigned_shifts - a.assigned_shifts;
        }
        return 0;
    });

    // Calculate statistics
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
                <Button 
                    variant="outline" 
                    className="text-primary border-primary" 
                    onClick={() => setIsDialogOpen(true)}
                    disabled={!isAdmin}
                >
                    Upload File
                </Button>
            </div>

            {/* Upload Students Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setFile(null);
                    setUploadError(null)
                    setUploadSuccess(null)
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
                        onClick={handleSubmit} 
                        disabled={uploadingStudents || !file}
                        className="text-white"
                    >
                        {uploadingStudents ? "Uploading..." : "Upload Students"}
                    </Button>
                    {uploadError && <p className="text-red-500">{uploadError}</p>}
                    {uploadSuccess && <p className="text-green-500">{uploadSuccess}</p>}
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>

            {/* Students table data */}
            {fetchingStudents ? (
                <p>Loading students...</p>
            ) : filteredStudents.length > 0 ? (
                <Card className="p-6">
                    <div className="overflow-x-auto">
                        {/* Table Title */}
                        <p className="text-center font-bold text-lg">Students for {selectedTerm} {selectedYear}</p>
                        <p className="text-center mb-2 ">
                           (Students can be sorted based on Name, Seniority and Shifts)
                        </p>
                        
                        <table className="w-full border-collapse">
                            {/* Table Head */}
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="p-2 rounded-tl-lg bg-primary text-white">Id</th>
                                    <th 
                                        className="border-l p-2 text-start cursor-pointer" 
                                        onClick={() => handleSort('preferred_name')}
                                    >
                                        Name
                                        {sortField === 'preferred_name' && (sortOrder === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />)}
                                    </th>
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
                                {sortedStudents.map((student, index) => (
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
  
  