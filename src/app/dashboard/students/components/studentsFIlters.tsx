"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

export function StudentsFilters({
  selectedYear,
  setSelectedYear,
  selectedTerm,
  setSelectedTerm,
  filter,
  setFilter,
}: {
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  selectedTerm: string;
  setSelectedTerm: (t: string) => void;
  filter: string;
  setFilter: (f: "all" | "sub" | "working" | "notWorking") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline">{selectedYear}</Button>

      <Button variant="default" size="icon" className="text-white" onClick={() => setSelectedYear(selectedYear - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" className="bg-[#d9d9d9]" onClick={() => setSelectedYear(selectedYear + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Select value={selectedTerm} onValueChange={setSelectedTerm}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Select term" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {["Fall Term", "Winter Term", "Spring Term", "Summer Term", "Fall Break", "Winter Break", "Spring Break", "Summer Break"].map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline">
        <Filter />
      </Button>

      <Select value={filter} onValueChange={setFilter}>
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
  );
}
