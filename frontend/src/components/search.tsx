"use client"

import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

export function Search() {
  return (
    <div className="flex w-full max-w-sm items-center space-x-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Try searching 'students'" className="pl-8" />
      </div>
    </div>
  )
}

