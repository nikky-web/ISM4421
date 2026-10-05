export type TaskType = 'cleaning' | 'maintenance' | 'general'
export type TaskStatus = 'pending' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type BookingStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'

export interface Property {
  id: string
  user_id: string
  name: string
  address: string | null
  property_type: string | null
  notes: string | null
  icon: string
  is_sample: boolean
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  property_id: string
  guest_name: string
  check_in: string
  check_out: string
  status: BookingStatus
  notes: string | null
  is_sample: boolean
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  property_id: string
  type: TaskType
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  is_sample: boolean
  created_at: string
  updated_at: string
}

export const PROPERTY_ICONS = ['🏖️', '🏡', '🏙️', '🏕️', '🏔️', '🌴', '🏠', '🛖'] as const
