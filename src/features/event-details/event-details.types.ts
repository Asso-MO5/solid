/**
 * Types pour la feature event-details
 */

export interface EventDetailsData {
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
  organizerId: string
  createdAt: Date
  updatedAt: Date
}

export interface EventDetailsState {
  event: EventDetailsData | null
  loading: boolean
  error: string | null
  isOpen: boolean
}
