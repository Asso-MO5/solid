/**
 * Types pour la feature events (collection)
 */

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  category: string
  status: string
  allowedRoles: string[]
  isConfidential: boolean
  color: string
  [key: string]: unknown
}

export interface EventsState {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
}

export interface EventsFilters {
  startDate?: Date
  endDate?: Date
  category?: string
  status?: string
}
