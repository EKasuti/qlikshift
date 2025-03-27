// ---------------- USER ---------------- //
export interface User {
  id: string
  email: string
  username: string | null
  created_at: string
  role?: string
  email_confirmed_at?: string
  last_sign_in_at?: string
}
