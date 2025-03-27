"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";

type ContextType = {
    user: User | null;
    error: string | null;
    isLoading: boolean;
};

const UserContext = React.createContext<ContextType>({
    user: null,
    error: null,
    isLoading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUser = async () => {
        try {
            // Get current session with detailed loggin
            const sessionResult = await supabase.auth.getSession();

            const { data: { session }, error: sessionError } = sessionResult;

            if (sessionError) {
                throw new Error(sessionError.message);
            }

            if (!session) {
                setUser(null);
                setIsLoading(false);
            return;
            }

            // Get fresh user details from Supabase
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error(userError?.message || "User not found");
            }

            const apiResponse = await fetch("/api/auth", {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

            if (!apiResponse.ok) {
                throw new Error("API validation failed");
            }

            setUser({
                id: user.id,
                email: user.email!,
                username: user.user_metadata?.username,
                created_at: user.created_at,
                role: user.role,
                email_confirmed_at: user.email_confirmed_at,
                last_sign_in_at: user.last_sign_in_at,
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load user data");
        } finally {
            setIsLoading(false);
        }};

        fetchUser();
    }, []);

    return <UserContext.Provider value={{ user, error, isLoading }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
