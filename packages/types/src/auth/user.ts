export type UserRole = "admin" | "exec" | "user"

/** Roles that can access admin / staff-protected surfaces. */
export function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "exec"
}

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
