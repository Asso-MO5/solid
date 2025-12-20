import type { CalendarEvent, CalendarView, CalendarDay } from "./Cal.types"
import type { JSX } from "solid-js"

export interface CalDayProps {
  day: CalendarDay
  view: CalendarView
  onDayClick: (day: Date, hour?: number) => void
  onItemClick?: (event: CalendarEvent) => void
  renderItem?: (event: CalendarEvent, day: Date) => JSX.Element
  formatDate: (date: Date) => string
  highlightedEventId?: string | null
  showMembersCount?: boolean
}

export interface CalDayHourProps {
  hour: number
  events: CalendarEvent[]
  onHourClick: (date: Date, hour: number) => void
  onItemClick?: (event: CalendarEvent) => void
  renderItem?: (event: CalendarEvent, day: Date) => JSX.Element
}
