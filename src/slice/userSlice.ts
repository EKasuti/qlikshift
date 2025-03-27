import { StateCreator } from "zustand";

import { fetchUserDetails } from "@/apis/authApis";

// User interface
export interface User {
    id: string;
    email: string;
    username: string | null;
    created_at: string;
    role: string;
    email_confirmed_at: string;
    last_sign_in_at: string;
}

// User slice state
export interface UserState {
    fetchingUser: boolean;
    fetchingUserError: string | null;
    user: User | null;
    fetchUser: () => Promise<void>;
}

// User slice
export const UserSlice: StateCreator<UserState> = (set) => ({
    user: null,
    fetchingUser: false,
    fetchingUserError: null,

    fetchUser: async () => {
        try {
        const response = await fetchUserDetails();

        set(() => ({
            user: response.user,
        }));
        } catch (error) {
        console.error(`Couldn't fetch user info: ${error}`);
        set(() => ({
            user: null,
        }));
        }
    },
});