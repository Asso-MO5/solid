/**
 * Types pour la feature tickets (gestion complète des billets)
 */

import type { Ticket } from "../entries/entries.types"

export interface TicketsFilter {
  search?: string // Recherche unifiée (email, checkout_id, qr_code)
  reservation_date?: string // Format YYYY-MM-DD
  status?: Ticket['status']
  page: number // Minimum 1, default 1
  limit: number // Minimum 1, default 500
}

export interface TicketsCtrlReturn {
  // État
  tickets: () => Ticket[]
  isLoading: () => boolean
  isFetching: () => boolean
  filter: () => TicketsFilter
  totalPages: () => number
  currentPage: () => number

  // Actions
  setFilter: (filter: Partial<TicketsFilter>, immediate?: boolean) => void
  getTickets: () => Promise<void>
  resetFilters: () => void
}

export interface UpdateTicketData {
  reservation_date?: string
  slot_start_time?: string
  slot_end_time?: string
  email?: string
  status?: 'active' | 'paid' | 'used' | 'cancelled' | 'refunded'
}

export interface TicketActionsCtrlReturn {
  updateTicket: (ticketId: string, data: UpdateTicketData) => Promise<void>
  resendTickets: (checkoutId: string) => Promise<void>
  isUpdating: () => boolean
  isResending: () => boolean
}

