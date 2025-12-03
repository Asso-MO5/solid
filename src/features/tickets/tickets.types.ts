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

