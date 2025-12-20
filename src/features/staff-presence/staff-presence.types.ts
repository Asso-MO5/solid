import { Accessor } from "solid-js"
import { CalendarEvent } from "~/ui/Cal"

export type PresencePeriod = 'morning' | 'afternoon' | 'both'

// Structure de l'API
export interface StaffPresenceApi {
  id: string
  user_id: string
  user_name: string
  date: string
  period: PresencePeriod
  refused_by_admin: boolean
  created_at: string
  updated_at: string
}

// Structure interne (transformée)
export interface StaffPresence {
  id: string
  user_id: string
  user_name: string
  date: string
  period: PresencePeriod
  refused: boolean // Mappé depuis refused_by_admin
  created_at: string
  updated_at: string
}

export interface StaffPresenceDayApi {
  date: string
  day_name: string
  presences: StaffPresence[]
}

export interface StaffPresenceCalendarResponse {
  days: StaffPresenceDayApi[]
  start_date: string
  end_date: string
  view: string
}

export interface StaffPresenceFilter {
  start_date?: string
  end_date?: string
  view?: 'month' | 'week' | 'day' | 'list'
  period?: PresencePeriod
  member_id?: string
  refused?: boolean
}

export interface CreatePresenceData {
  date: string
  period: PresencePeriod
}

export interface UpdatePresenceData {
  period?: PresencePeriod
  refused?: boolean
}

export interface StaffPresenceCtrlReturn {
  presences: () => StaffPresence[]
  days: () => StaffPresenceDayApi[]
  isLoading: () => boolean
  isFetching: () => boolean
  error: () => string | null
  filter: () => StaffPresenceFilter
  setFilter: (updates: Partial<StaffPresenceFilter>, updateURL?: boolean) => void
  resetFilters: () => void
  getPresences: (view?: 'month' | 'week' | 'day' | 'list', selectedDate?: Date) => Promise<void>
  createPresence: (data: CreatePresenceData) => Promise<void>
  updatePresence: (id: string, data: UpdatePresenceData) => Promise<void>
  deletePresence: (id: string) => Promise<void>
  toggleRefuse: (id: string, refused: boolean) => Promise<void>
  presencesAsEvents: Accessor<CalendarEvent[]>
}

