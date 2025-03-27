"use client"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/user-context"

export function UserNav() {
    const { user, isLoading } = useUser()
    const router = useRouter()
    const supabase = createClientComponentClient()
    
    const getInitials = () => {
        if (isLoading) return "--"
        if (!user) return "--"
        
        // Handle Undefined values
        return user.username?.substring(0, 2).toUpperCase() || 
               user.email?.substring(0, 2).toUpperCase() || 
               "--"
    }

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            
            if (error) throw error

            router.refresh()
            router.push('/login')
        } catch (error) {
            console.error('Error logging out:', error)
        }
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