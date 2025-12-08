import { createMemo, createSignal, onMount } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import type { EntriesCtrlReturn, EntriesFilter, Ticket } from "./entries.types"

export const useEntries = (): EntriesCtrlReturn => {
  const [tickets, setTickets] = createSignal<Ticket[]>([])
  const [isFetching, setIsFetching] = createSignal<boolean>(true)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [filter, setFilter] = createSignal<EntriesFilter>({
    search: '',
    sortField: 'used_at',
    sortDirection: 'desc'
  })

  // Obtenir la date du jour au format YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getTickets = async () => {
    if (isLoading()) return

    setIsLoading(true)
    try {
      const today = getTodayDate()
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/tickets?reservation_date=${today}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des billets')
      }

      const data = await response.json()

      setTickets(Array.isArray(data.tickets) ? data.tickets.map((d: { notes: string }) => {
        return {
          ...d,
          notes: d.notes ? JSON.parse(d.notes) : null
        } as Ticket
      }) : [])
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les billets.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const updateFilter = (newFilter: Partial<EntriesFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }

  // Filtrage et tri côté client
  const filteredTickets = createMemo(() => {
    let result = [...tickets()]
    const currentFilter = filter()
    // Filtre par recherche (nom, email, QR code)
    if (currentFilter.search) {
      const searchLower = currentFilter.search.toLowerCase()
      result = result.filter(ticket =>
        ticket.first_name?.toLowerCase().includes(searchLower) ||
        ticket.last_name?.toLowerCase().includes(searchLower) ||
        ticket.email?.toLowerCase().includes(searchLower) ||
        ticket.qr_code.toLowerCase().includes(searchLower) ||
        ticket.id.toLowerCase().includes(searchLower) ||
        ticket.slot_start_time?.toLowerCase().includes(searchLower) ||
        ticket.used_at?.toLowerCase().includes(searchLower)
      )
    }

    // Filtre par statut
    if (currentFilter.status) {
      result = result.filter(ticket => ticket.status === currentFilter.status)
    }

    // Tri
    result.sort((a, b) => {
      const field = currentFilter.sortField
      let aValue: string | number | undefined
      let bValue: string | number | undefined

      switch (field) {
        case 'first_name':
          aValue = a.first_name || ''
          bValue = b.first_name || ''
          break
        case 'last_name':
          aValue = a.last_name || ''
          bValue = b.last_name || ''
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'slot_start_time':
          aValue = a.slot_start_time || ''
          bValue = b.slot_start_time || ''
          break
        case 'used_at':
          aValue = a.used_at || ''
          bValue = b.used_at || ''
          break
        default:
          return 0
      }

      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return currentFilter.sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  })

  onMount(() => {
    getTickets()
  })

  return {
    isFetching,
    tickets,
    filteredTickets,
    isLoading,
    filter,
    setFilter: updateFilter,
    getTickets
  }
}

