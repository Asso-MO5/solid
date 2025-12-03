import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import { getAllURLParams, updateURL } from "~/utils/url-sync"
import type { Ticket } from "../entries/entries.types"
import type { TicketsCtrlReturn, TicketsFilter } from "./tickets.types"

export const useTickets = (): TicketsCtrlReturn => {
  const [tickets, setTickets] = createSignal<Ticket[]>([])
  const [isFetching, setIsFetching] = createSignal<boolean>(true)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [totalPages, setTotalPages] = createSignal<number>(1)
  const [currentPage, setCurrentPage] = createSignal<number>(1)

  // Initialiser les filtres depuis l'URL
  const getInitialFilter = (): TicketsFilter => {
    const urlParams = getAllURLParams()
    return {
      search: urlParams.search || undefined,
      reservation_date: urlParams.reservation_date || undefined,
      status: (urlParams.status as Ticket['status']) || undefined,
      page: urlParams.page ? parseInt(urlParams.page, 10) : 1,
      limit: urlParams.limit ? parseInt(urlParams.limit, 10) : 500
    }
  }

  const [filter, setFilter] = createSignal<TicketsFilter>(getInitialFilter())

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const buildQueryParams = (filters: TicketsFilter): string => {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.reservation_date) params.append('reservation_date', filters.reservation_date)
    if (filters.status) params.append('status', filters.status)

    params.append('page', String(Math.max(1, filters.page || 1)))
    params.append('limit', String(Math.max(1, filters.limit || 500)))

    return params.toString()
  }

  const getTickets = async () => {
    if (isLoading()) return

    setIsLoading(true)
    try {
      const queryParams = buildQueryParams(filter())
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/tickets?${queryParams}`,
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

      // Si l'API retourne un objet avec pagination
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const responseData = data as {
          tickets?: unknown[]
          totalPages?: number
          total_pages?: number // Support des deux formats
          page?: number
          current_page?: number
          currentPage?: number // Support des deux formats
          total?: number
        }
        setTickets(Array.isArray(responseData.tickets) ? responseData.tickets.map((d) => {
          const ticket = d as Record<string, unknown>
          return {
            ...ticket,
            notes: ticket.notes ? (typeof ticket.notes === 'string' ? JSON.parse(ticket.notes) : ticket.notes) : null
          } as Ticket
        }) : [])

        // Récupérer totalPages (camelCase ou snake_case)
        const totalPagesValue = responseData.totalPages ?? responseData.total_pages
        if (totalPagesValue !== undefined) {
          setTotalPages(totalPagesValue)
        }

        // Récupérer currentPage (camelCase ou snake_case)
        const currentPageValue = responseData.currentPage ?? responseData.current_page ?? responseData.page
        if (currentPageValue !== undefined) {
          setCurrentPage(currentPageValue)
          // Ne pas mettre à jour le filtre si la page est déjà la même pour éviter la boucle
          const currentFilter = filter()
          if (currentFilter.page !== currentPageValue) {
            setFilter(prev => ({ ...prev, page: currentPageValue }))
          }
        }
      } else {
        // Si l'API retourne directement un tableau (pas de pagination)
        setTickets(Array.isArray(data) ? data.map((d) => {
          const ticket = d as Record<string, unknown>
          return {
            ...ticket,
            notes: ticket.notes ? (typeof ticket.notes === 'string' ? JSON.parse(ticket.notes) : ticket.notes) : null
          } as Ticket
        }) : [])
        // Pas de pagination, donc 1 page
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les billets.')
      console.error(error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const updateFilter = (newFilter: Partial<TicketsFilter>, immediate = false) => {
    setFilter(prev => {
      const updated = { ...prev, ...newFilter }
      // Réinitialiser la page à 1 si on change un filtre autre que la page
      if (newFilter.page === undefined && Object.keys(newFilter).length > 0) {
        updated.page = 1
      }

      // Mettre à jour l'URL
      updateURL({
        search: updated.search,
        reservation_date: updated.reservation_date,
        status: updated.status,
        page: updated.page,
        limit: updated.limit
      })

      return updated
    })

    // Si immediate est true (pagination, reset), appeler immédiatement
    if (immediate) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
      void getTickets()
    }
    // Sinon, le fetch sera déclenché par l'effect avec debounce
  }

  // Effect avec debounce pour déclencher le fetch
  createEffect(() => {
    // Accéder au filtre pour créer une dépendance réactive
    filter()

    // Annuler le timer précédent
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Débouncer l'appel API (500ms)
    debounceTimer = setTimeout(() => {
      void getTickets()
    }, 500)

    // Cleanup du timer
    onCleanup(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    })
  })

  const resetFilters = () => {
    // Annuler le debounce en cours
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    const resetFilter = {
      page: 1,
      limit: 500
    }
    setFilter(resetFilter)

    // Mettre à jour l'URL
    updateURL({
      search: undefined,
      reservation_date: undefined,
      status: undefined,
      page: 1,
      limit: 500
    })

    // Appel immédiat pour reset
    void getTickets()
  }

  onMount(() => {
    // Premier fetch immédiat au montage
    void getTickets()
  })

  return {
    isFetching,
    tickets,
    isLoading,
    filter,
    totalPages,
    currentPage,
    setFilter: updateFilter,
    getTickets,
    resetFilters
  }
}

