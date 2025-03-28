"use client"

import { useStore } from "@/utils/useStore"
import { useEffect } from "react"

export function IsAdmin() {
    const { fetchingUser, isAdmin, fetchUser } = useStore();
    
    useEffect(() => {
        fetchUser();
    }, [fetchUser])
    

    return (
        <div className="flex h-[40px] items-center text-center justify-center gap-4 px-4 bg-primary text-white">
            {fetchingUser ? (
                <p>Fetchig user details...</p>
            ) : (
                <div>
                    {isAdmin ? (
                        <h1> You are viewing as an Admin </h1>
                    ) : (
                        <h1> ⚠️ You are in test mode and will not be able to make changes </h1>
                    )}
                </div>
            )}
        </div>
    )
}