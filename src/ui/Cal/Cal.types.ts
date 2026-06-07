import type { Accessor } from "solid-js"

// Types génériques pour l'UI
export type CalendarView = 'month' | 'week' | 'day' | 'list'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  items: CalendarEvent[]
  isOpen?: boolean
  paid_tickets_count?: number
  members_presence_count?: number
  openingHours?: Array<{
    start_time: string
    end_time: string
    audience_type: string
    description: string
  }>
  holidayPeriods?: Array<{
    id: string
    name: string
    start_date: string
    end_date: string
    zone: string
  }>
  closurePeriods?: Array<{
    id: string
    name: string
    start_date: string
    end_date: string
    zone: string
  }>
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  category: 'live' | 'mediation' | 'workshop' | 'conference' | 'exhibition' | 'other'
  status?: 'draft' | 'private' | 'member' | 'public'
  allowedRoles?: string[]
  isConfidential?: boolean
  color?: string
}

export interface CalendarItem {
  startDate?: Date
  endDate?: Date
  date?: Date
  title?: string
  [key: string]: unknown
}

export interface CalendarDayInfo {
  is_open: boolean
  opening_hours: Array<{
    start_time: string
    end_time: string
    audience_type: string
    description: string
  }>
  holiday_periods: Array<{
    id: string
    name: string
    start_date: string
    end_date: string
    zone: string
  }>
  closure_periods: Array<{
    id: string
    name: string
    start_date: string
    end_date: string
    zone: string
  }>
  paid_tickets_count: number
}

export interface CalendarCtrlReturn {
  view: Accessor<CalendarView>
  selectedDate: Accessor<Date>

  setView: (view: CalendarView) => void
  setSelectedDate: (date: Date) => void
  setItems: (items: CalendarEvent[]) => void
  setDaysInfo: (daysInfo: Map<string, CalendarDayInfo>) => void

  goToPrevious: () => void
  goToNext: () => void
  goToToday: () => void

  calendarDays: Accessor<CalendarDay[]>
  currentMonthName: Accessor<string>
  currentYear: Accessor<number>
  weekDays: Accessor<string[]>
  listEvents: () => CalendarEvent[]

  formatDate: (date: Date) => string
}
