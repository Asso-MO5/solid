/**
 * Types pour la feature event-create
 */

export interface EventCreateData {
  title: string
  description?: string
  category: string
  status?: string
  startDate: string
  endDate: string
  allowedRoles?: string[]
  isConfidential?: boolean
}

export interface EventCreateState {
  loading: boolean
  error: string | null
  isOpen: boolean
  selectedDate?: Date | null
  currentView?: 'month' | 'week' | 'day' | 'list'
}

export interface EventCreateFormData {
  title: string
  description: string
  category: string
  status: string
  startDate: string
  endDate: string
  allowedRoles: string[]
  isConfidential: boolean
}
