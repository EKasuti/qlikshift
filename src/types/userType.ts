export interface User {
    id: string;
    email: string;
    username: string | null;
    is_super_admin: boolean;
    created_at: string;
    role: string;
    email_confirmed_at: string;
    last_sign_in_at: string;
}
