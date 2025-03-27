"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Check, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Assignment data interface
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
    const [selectedTerm, setSelectedTerm] = useState<string>("Spring Term");
    const [selectedDesk, setSelectedDesk] = useState<string>("jmc");
    const [assignments, setAssignments] = useState<AssignmentData[]>([]);
    const [showLogs, setShowLogs] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [isAssigning, setIsAssigning] = useState<boolean>(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [setToMaxShifts, setSetToMaxShifts] = useState<boolean>(false);
    const [shiftsToAssign, setShiftsToAssign] = useState(1);
    const [considerPreferredDesk, setConsiderPreferredDesk] = useState(false);

    // Function to fetch assignments - using useCallback to memoize the function
    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = selectedTerm.endsWith("Break") 
                ? `/api/assign/interim?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`
                : `/api/assign/term?year=${selectedYear}&term_or_break=${selectedTerm}&desk=${selectedDesk}`;
                
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Error fetching assignments: ${response.status}`);
            }
            const data: AssignmentData[] = await response.json();
            setAssignments(data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedTerm, selectedDesk]);

    // Fetch assignments when selection changes
    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // Handle assigning shifts
    const handleAssign = async () => {
        setIsAssigning(true);
        
        const newAssignment = {
            desk_name: selectedDesk,
            year: selectedYear.toString(),
            term_or_break: selectedTerm,
            round_number: assignments.length + 1,
            set_to_max_shifts: setToMaxShifts,
            shifts_to_assign: shiftsToAssign,
            consider_preferred_desk: considerPreferredDesk,
        };
        
        const endpoint = selectedTerm.endsWith("Break") 
            ? "/api/assign/interim" 
            : "/api/assign/term";

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newAssignment),
            });

            if (!response.ok) {
                throw new Error(`Failed to assign shifts: ${response.status}`);
            }

            // Get the result and re-fetch assignments
            const result = await response.json();
            console.log("Assignment successful:", result);
            
            // Re-fetch the assignments to get the updated list with logs
            await fetchAssignments();
            
            // Reset dialog form
            setSetToMaxShifts(false);
            setShiftsToAssign(1);
            setConsiderPreferredDesk(false);
            
        } catch (error) {
            console.error("Error assigning shifts:", error);
        } finally {
            setIsAssigning(false);
            setIsDialogOpen(false);
        }
    };

    // Toggle logs visibility
    const toggleLogs = (id: number) => {
        setShowLogs(prev => ({ ...prev, [id]: !prev[id] }));
    };

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
                        disabled={loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Button to Increment Year */}
                    <Button 
                        variant="outline" 
                        size="icon"
                        className="bg-[#d9d9d9]"
                        onClick={() => setSelectedYear(prev => prev + 1)}
                        disabled={loading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Terms List */}
                    <Select 
                        defaultValue={selectedTerm} 
                        onValueChange={setSelectedTerm}
                        disabled={loading}
                    >
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
                <Button 
                    variant="outline" 
                    className="text-primary border-primary"
                    onClick={() => setIsDialogOpen(true)}
                    disabled={loading}
                >
                    Assign
                </Button>
            </div>

            {/* Assign Shift Dialog */}
            <Dialog 
                open={isDialogOpen} 
                onOpenChange={(open) => {setIsDialogOpen(open)}}
            >
                <DialogContent className="bg-white"> 
                    <DialogHeader>
                        <DialogTitle>Assign Shift</DialogTitle>
                    </DialogHeader>
                    <div className="mb-4">
                        <p><strong>Desk Name:</strong> {selectedDesk.toUpperCase()}</p>
                        <p><strong>Year:</strong> {selectedYear}</p>
                        <p><strong>Term:</strong> {selectedTerm}</p>
                        <p><strong>Round Number:</strong> {assignments.length + 1}</p>
                    </div>
                    <form className="flex flex-col gap-4">
                        {/* Set to Max Shifts */}
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="setToMaxShifts" 
                                checked={setToMaxShifts}
                                onChange={(e) => setSetToMaxShifts(e.target.checked)}
                                disabled={isAssigning}
                            />
                            <label htmlFor="setToMaxShifts" className="ml-2">Set to Max Shifts</label>
                        </div>

                        {/* Shifts to Assign */}
                        <div className="flex items-center">
                            <label htmlFor="shiftsToAssign" className="mr-2">Shifts to Assign (2hour shifts):</label>
                            <input 
                                type="number" 
                                id="shiftsToAssign" 
                                min="1" 
                                value={shiftsToAssign}
                                className="border rounded-lg p-2"
                                onChange={(e) => setShiftsToAssign(Number(e.target.value))}
                                disabled={isAssigning}
                            />
                        </div>

                        {/* Consider Preferred Desk */}
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="considerPreferredDesk"
                                checked={considerPreferredDesk}
                                onChange={(e) => setConsiderPreferredDesk(e.target.checked)}
                                disabled={isAssigning}
                            />
                            <label htmlFor="considerPreferredDesk" className="ml-2">Consider Preferred Desk</label>
                        </div>

                        <Button 
                            variant="default" 
                            onClick={handleAssign}
                            disabled={isAssigning}
                            className="bg-primary text-white"
                        >
                            {isAssigning ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                </>
                            ) : (
                                "Confirm Assignment"
                            )}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        
            {/* Desk tab names */}
            <Tabs 
                defaultValue="jmc" 
                className="w-fit mt-2 mb-2" 
                value={selectedDesk} 
                onValueChange={setSelectedDesk}
            >
                <TabsList className="bg-transparent border-none">
                    {/* Jmc Desk */}
                    <TabsTrigger 
                        value="jmc" 
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                        disabled={loading}
                    >
                        JMC
                    </TabsTrigger>
                    {/* Circ Desk */}
                    <TabsTrigger 
                        value="circ"
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                        disabled={loading}
                    >
                        Circ
                    </TabsTrigger>
                    {/* Baker Desk */}
                    <TabsTrigger 
                        value="baker"
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                        disabled={loading}
                    >
                        Baker
                    </TabsTrigger>
                    {/* Orozco Desk */}
                    <TabsTrigger 
                        value="orozco"
                        className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:uppercase"
                        disabled={loading}
                    >
                        Orozco
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading assignments...</span>
                </div>
            )}

            {/* Assignments */}
            {!loading && (
                <div>
                    {assignments.length === 0 ? (
                        <div className="flex justify-center flex-col items-center p-8 border rounded-md bg-gray-50">
                            <p className="text-center text-muted-foreground">You currently have not assigned any shifts for {selectedDesk.toUpperCase()} desk calendar for {selectedTerm} in {selectedYear}.</p>
                            <Button 
                                variant="default"
                                className="mt-4 text-white" 
                                onClick={() => setIsDialogOpen(true)}
                            >
                                Assign Shifts
                            </Button>
                        </div>
                    ) : (
                        assignments.map(assignment => (
                            <div key={assignment.id} className="border rounded-md p-4 mb-4 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="font-bold text-lg">Round {assignment.round_number}</h2>
                                        <p className="text-sm text-gray-500">Created at: {new Date(assignment.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <p>Shifts assigned: <strong>{assignment.shifts_to_assign}</strong></p>
                                    {/* Preferred Desk */}
                                    <p>
                                        {assignment.consider_preferred_desk ? (
                                            <Check className="text-green-500 inline-block" />
                                        ) : (
                                            <X className="text-red-500 inline-block" />
                                        )}
                                        {assignment.consider_preferred_desk ? " Considered preferred desk" : " Did not consider preferred desk"}
                                    </p>

                                    {/* Max shifts */}
                                    <p>
                                        {assignment.set_to_max_shifts ? (
                                            <Check className="text-green-500 inline-block" />
                                        ) : (
                                            <X className="text-red-500 inline-block" />
                                        )}
                                        {assignment.set_to_max_shifts ? " Assigned max shifts" : " Did not assign max shifts"}
                                    </p>
                                </div>
                            
                                <button
                                    className="mt-4 flex items-center text-primary hover:underline"
                                    onClick={() => toggleLogs(assignment.id)}
                                >
                                    {showLogs[assignment.id] ? "Hide" : "Show"} Activity Logs for Round {assignment.round_number}
                                    {showLogs[assignment.id] ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                                </button>

                                {showLogs[assignment.id] && (
                                    <div className="mt-2 bg-gray-50 p-4 rounded-md border overflow-auto max-h-64">
                                        {assignment.log_summary ? (
                                            <pre className="whitespace-pre-wrap text-sm">{assignment.log_summary}</pre>
                                        ) : (
                                            <p className="text-gray-500 italic">No logs available for this assignment.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}