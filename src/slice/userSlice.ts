import { StateCreator } from "zustand";
import { fetchUserDetails } from "@/apis/authApis";
import { User } from "@/types/userType";

// User slice state
export interface UserState {
    fetchingUser: boolean;
    fetchingUserError: string | null;
    isAdmin: boolean;
    user: User | null;
    fetchUser: () => Promise<void>;
}

// User slice
export const UserSlice: StateCreator<UserState> = (set) => ({
    user: null,
    fetchingUser: false,
    fetchingUserError: null,
    isAdmin: false,

    fetchUser: async () => {
        try {
            set({fetchingUser: true, fetchingUserError: null });
            const response = await fetchUserDetails();

            set((state) => ({
                ...state,
                user: response.user,
                isAdmin: response?.user?.is_super_admin || false,
                fetchingUser: false,
            }));

        } catch (error) {
            console.error(`Couldn't fetch user info: ${error}`);
            set((state) => ({
                ...state,
                fetchingUser: false,
                fetchingUserError: error as string,
            }));
        }
    },
});