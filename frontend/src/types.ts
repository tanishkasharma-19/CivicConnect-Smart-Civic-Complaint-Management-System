export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}


export interface AuthResponse {
  token: string
  role: "CITIZEN" | "OFFICER" | "ADMIN" | string
  email: string
}

export interface Complaint {
  id: number
  title: string
  description: string
  category: string
  status: string
  address: string
  latitude: number
  longitude: number
  beforePhotoUrl?: string
  afterPhotoUrl?: string
  upvoteCount: number
  priorityScore?: number
  escalationLevel?: number
  department?: string
  resolutionNotes?: string
  deadline?: string
  createdAt?: string
  updatedAt?: string
  resolvedAt?: string
}

export interface DuplicateComplaint {
  complaintId: number
  title: string
  description: string
  category: string
  status: string
  latitude: number
  longitude: number
  address: string
  upvoteCount: number
  distanceMeters: number
}

export interface Notification {
  id: number
  message: string
  type: string
  isRead: boolean
  complaintId?: number
  createdAt?: string
}

export interface User {
  id: number
  name: string
  email: string
  role: "CITIZEN" | "OFFICER" | "ADMIN"
  designation?: string
  ward?: string
  department?: string
  isActive?: boolean
}

export interface Department {
  id: number
  name: string
  description?: string
  categoryType?: string
}

export interface AssignOfficerRequest {
  officerId: number
}

export interface CreateOfficerRequest {
  name: string
  email: string
  password: string
  departmentId?: number
}

export interface UpdateStatusRequest {
  status: string
}

export interface VerifyComplaintRequest {
  verified: boolean
}

/*
 * Backend complaint statuses.
 *
 * We keep this as a frontend union for places such as
 * StatusBadge, filters, and status displays.
 */
export type Status =
  | "REPORTED"
  | "VERIFIED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "ESCALATED"
  | "CLOSED"
  | "REJECTED"

/*
 * Backend category values are represented as strings because
 * we have not hard-coded a second, conflicting frontend enum.
 *
 * Examples from the backend:
 * ROAD
 * WATER
 * ELECTRICITY
 * GARBAGE
 * DRAINAGE
 * OTHER
 */
export type Category = string

/*
 * This is the frontend navigation role.
 * Backend AuthResponse uses uppercase roles.
 */
export type Role =
  | "citizen"
  | "officer"
  | "admin"

export type BackendRole =
  | "CITIZEN"
  | "OFFICER"
  | "ADMIN"

/*
 * Figma navigation pages.
 * These are frontend page identifiers, not backend APIs.
 */
export type Page =
  | "login"
  | "register"
  | "forgot-password"
  | "verify-email"
  | "reset-password"
  | "terms"
  | "privacy"
  | "citizen-home"
  | "citizen-explore"
  | "citizen-report"
  | "citizen-detail"
  | "citizen-my-complaints"
  | "citizen-notifications"
  | "citizen-profile"

  | "officer-dashboard"
  | "officer-complaints"
  | "officer-detail"
  | "officer-profile"
  | "officer-notifications"

  | "admin-dashboard"
  | "admin-complaints"
  | "admin-users"
  | "admin-departments"
  | "admin-escalations"
  | "admin-analytics"
  | "admin-assignments"
  | "admin-notifications"

export interface NavProps {
  navigate: (
    page: Page,
    params?: {
      complaintId?: string
    }
  ) => void
}