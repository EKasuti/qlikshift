"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AssignmentData {
    id: number;
    year: string;
    term_or_break: string;
    desk_name: string;
    round_number: number;
    set_to_max_shifts: boolean;
    shifts_to_assign: number;
    consider_preferred_desk: boolean;
    log_summary: string;
    created_at: string;
}

export default function AssignPage() {
    const [selectedYear, setSelectedYear] = useState<number>(2025);
    const [selectedTerm, setSelectedTerm] = useState<string>("Spring Break");
    const [selectedDesk, setSelectedDesk] = useState<string>("jmc")
    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
    const [showLogs, setShowLogs] = useState<Record<number, boolean>>({});

    useEffect(() => {
        async function fetchAssignments() {
            try {
                const response = await fetch(`/api/assign/interim?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`);
                const data: AssignmentData[] = await response.json();
                setAssignments(data);
            } catch (error) {
                console.error("Error fetching assignments:", error);
            }
        }

        fetchAssignments();
    }, [selectedYear, selectedTerm, selectedDesk]);


    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Assign</h1>
            <p className="text-muted-foreground">Assign shifts to students</p>

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
                    Assign
                </Button>
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

            {/* Assignments */}
            <div>
                {assignments.length === 0 ? (
                    <div className="flex justify-center flex-col items-center">
                        <p className="text-center text-muted" >You currently haven’t assigned any shifts for {selectedDesk.toUpperCase()} desk calendar for {selectedTerm} in {selectedYear}.</p>
                        <p>Click on the assign button</p>
                    </div>
                ) : (
                    assignments.map(assignment => (
                        <div key={assignment.id} className="border rounded-md p-4 mb-4">
                            <h2 className="font-bold">Round {assignment.round_number}</h2>
                            <p>Number of shifts set to <strong>{assignment.shifts_to_assign}</strong></p>
                            <p>{assignment.consider_preferred_desk ? "Considered preferred desk" : "Did not consider preferred desk"}</p>
                            <p>{assignment.set_to_max_shifts ? "Assigned max shifts" : "Did not assign max shifts"}</p>
                        
                            <button
                                className="mt-2 flex items-center justify-between text-primary"
                                onClick={() => setShowLogs(prev => ({ ...prev, [assignment.id]: !prev[assignment.id] }))}
                            >
                                {showLogs[assignment.id] ? "Hide" : "Show"} Activity Logs for Round {assignment.round_number}
                                {showLogs[assignment.id] ? <ChevronUp className="ml-2" /> : <ChevronDown className="ml-2" />}
                            </button>

                            {showLogs[assignment.id] && (
                                <div className="mt-2 bg-gray-100 p-2">
                                    <pre className="whitespace-pre-wrap">{assignment.log_summary}</pre>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
    )
}
  
  