"use client"

import { StatCardData, StatsCards } from "@/components/dashboard/stats-cards";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Users, UserCheck, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/types";
import { Card } from "@/components/ui/card";


export default function StudentsPage() {
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedTerm, setSelectedTerm] = useState<string>("Spring Break");
    const [students, setStudents] = useState<Student[]>([]); 
    const [loading, setLoading] = useState<boolean>(false); 

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                const response = selectedTerm.endsWith("Break")
                    ? await fetch(`/api/students/interim?year=${selectedYear}&term_or_break=${selectedTerm}`)
                    : await fetch(`/api/students/term?year=${selectedYear}&term_or_break=${selectedTerm}`);
                
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedYear, selectedTerm]);

    // Calculate statistics
    const totalStudents = students.length;
    const averageHoursPerWeek = totalStudents > 0 
        ? (students.reduce((sum, student) => sum + student.preferred_hours_per_week, 0) / totalStudents) 
        : 0;
    const assignedStudents = students.filter(student => student.assigned_shifts > 0).length;

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
                </div>
                <Button variant="outline" className="text-primary border-primary">
                    Add Students
                </Button>
            </div>

            {/* Students table data */}
            {loading ? (
                <p>Loading students...</p>
            ) : students.length > 0 ? (
                <Card className="p-6">
                    <div className="overflow-x-auto">
                        {/* Table Title */}
                        <p className="text-center mb-2 font-bold text-lg">Students for {selectedTerm} {selectedYear}</p>
                        
                        <table className="w-full border-collapse">
                            {/* Table Head */}
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th className="p-2 rounded-tl-lg">Id</th>
                                    <th className="border-l p-2 text-start">Preferred Name</th>
                                    <th className="border-l p-2 text-start">Email</th>
                                    <th className="border-l p-2 text-start">Jobs</th>
                                    <th className="border-l p-2 text-start">Preferred Desk</th>
                                    <th className="border-l p-2 text-start">Hrs / Wk</th>
                                    <th className="border-l p-2 text-start">Seniority</th>
                                    <th className="border-l p-2 text-start">Max shifts</th>
                                    <th className="border-l p-2 text-start rounded-tr-lg">Assigned shifts</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                {students.map((student, index) => (
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
                                        <td className="border p-2 text-start">{student.jobs}</td>
                                        <td className="border p-2 text-start">{student.preferred_desk}</td>
                                        <td className="border p-2 text-start">{student.preferred_hours_per_week}</td>
                                        <td className="border p-2 text-start">{student.seniority}</td>
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
  
  