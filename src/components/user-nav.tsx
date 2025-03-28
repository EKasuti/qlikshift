"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStore } from "@/utils/useStore"
import { useEffect } from "react"

export function UserNav() {
    const { fetchingUser, user, fetchUser } = useStore();
    const router = useRouter()

    useEffect(() => {
        fetchUser();
    }, [fetchUser])
    
    const getInitials = () => {
        if (fetchingUser) return "--"
        if (!user) return "--"
        
        // Handle Undefined values
        return user.email?.substring(0, 2).toUpperCase() || "--"
    }

    const handleLogout = async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button 
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white"
                    aria-label="User menu"
                >
                    {getInitials()}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] bg-white">
                {user?.email && (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                        {user.email}
                    </div>
                )}
                <DropdownMenuItem 
                    onSelect={handleLogout}
                    className="text-red-600 cursor-pointer focus:bg-red-50"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}