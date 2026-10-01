export type Status = 'PENDING' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'ESCALATED'
export type Role = 'citizen' | 'officer' | 'admin'
export type Category = 'Roads' | 'Water' | 'Electricity' | 'Garbage' | 'Drainage' | 'Street Lights' | 'Public Safety' | 'Other'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  avatar?: string
  joinedAt: string
  address?: string
  status: 'active' | 'inactive'
}

export interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
  avatar?: string
}

export interface TimelineEvent {
  id: string
  status: Status
  message: string
  timestamp: string
  by?: string
}

export interface Complaint {
  id: string
  title: string
  category: Category
  description: string
  status: Status
  priority: Priority
  location: string
  lat: number
  lng: number
  images: string[]
  reporterId: string
  reporterName: string
  reportedAt: string
  updatedAt: string
  upvotes: number
  comments: Comment[]
  assignedOfficerId?: string
  assignedOfficerName?: string
  department?: string
  timeline: TimelineEvent[]
  daysOverdue?: number
}

export interface Department {
  id: string
  name: string
  head: string
  officerCount: number
  activeComplaints: number
  resolvedComplaints: number
  performance: number
  color: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: string
  complaintId?: string
}

export type Page =
  | 'login' | 'register' | 'forgot-password'
  | 'citizen-home' | 'citizen-explore' | 'citizen-report'
  | 'citizen-detail' | 'citizen-my-complaints' | 'citizen-notifications' | 'citizen-profile'
  | 'officer-dashboard' | 'officer-complaints' | 'officer-detail'
  | 'admin-dashboard' | 'admin-complaints' | 'admin-users'
  | 'admin-departments' | 'admin-escalations' | 'admin-analytics' | 'admin-assignments'

export interface NavProps {
  navigate: (page: Page, params?: { complaintId?: string }) => void
}
