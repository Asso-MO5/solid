/**
 * Types pour la feature entries (validation des billets)
 */

export interface Ticket {
  id: string
  qr_code: string
  status: 'paid' | 'used' | 'cancelled' | 'refunded'
  reservation_date: string
  first_name?: string
  last_name?: string
  transaction_status?: 'paid' | 'not_paid'
  email?: string
  ticket_price: number
  checkout_id?: string
  ticket_type?: string
  slot_end_time: string // hh:mm:ss
  slot_start_time: string // hh:mm:ss
  created_at: string
  notes?: ParseNote
  used_at?: string
}

export type ParseNote = {
  guided_tour?: boolean
  guided_tour_price?: number
  checkout_id?: string
  pricing_info?: {
    price_name: string
    translations: {
      fr: {
        name: string
        description: string
      }
      en: {
        name: string
        description: string
      }
    }
    requires_proof: boolean
  }
}

export interface TicketScanResult {
  ticket: Ticket | null
  success: boolean
  message: string
  scannedAt: Date
}

export type SortField = 'first_name' | 'last_name' | 'email' | 'status' | 'slot_start_time' | 'used_at'
export type SortDirection = 'asc' | 'desc'

export interface EntriesFilter {
  search: string
  status?: Ticket['status']
  sortField: SortField
  sortDirection: SortDirection
}

export interface EntriesCtrlReturn {
  // État
  tickets: () => Ticket[]
  filteredTickets: () => Ticket[]
  isLoading: () => boolean
  isFetching: () => boolean
  filter: () => EntriesFilter

  // Actions
  setFilter: (filter: Partial<EntriesFilter>) => void
  getTickets: () => Promise<void>
}

