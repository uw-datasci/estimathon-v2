export type UserRole = "admin" | "user"

export interface AuthenticatedUser {
  /** Supabase auth.uid() */
  id: string
  email: string | null
  role: UserRole
}

export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  watIam: string | null
  faculty: string | null
  term: string | null
}
