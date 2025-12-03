import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import { getAllURLParams, updateURL } from "~/utils/url-sync"
import type { SpecialPeriodsCtrlReturn, SpecialPeriodsFilter, SpecialPeriod, CreatePeriodData, UpdatePeriodData } from "./special-periods.types"

export const useSpecialPeriods = (): SpecialPeriodsCtrlReturn => {
  const [periods, setPeriods] = createSignal<SpecialPeriod[]>([])
  const [isFetching, setIsFetching] = createSignal<boolean>(true)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [totalPages, setTotalPages] = createSignal<number>(1)
  const [currentPage, setCurrentPage] = createSignal<number>(1)

  // Initialiser les filtres depuis l'URL
  const getInitialFilter = (): SpecialPeriodsFilter => {
    const urlParams = getAllURLParams()
    return {
      type: urlParams.type as 'holiday' | 'closure' || undefined,
      date: urlParams.date || undefined,
      zone: urlParams.zone || undefined,
      is_active: urlParams.is_active === 'true' ? true : urlParams.is_active === 'false' ? false : undefined,
      page: urlParams.page ? parseInt(urlParams.page, 10) : 1,
      limit: urlParams.limit ? parseInt(urlParams.limit, 10) : 500
    }
  }

  const [filter, setFilter] = createSignal<SpecialPeriodsFilter>(getInitialFilter())

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const buildQueryParams = (filters: SpecialPeriodsFilter): string => {
    const params = new URLSearchParams()

    if (filters.type) params.append('type', filters.type)
    if (filters.date) params.append('date', filters.date)
    if (filters.zone) params.append('zone', filters.zone)
    if (filters.is_active !== undefined) params.append('is_active', String(filters.is_active))

    params.append('page', String(Math.max(1, filters.page || 1)))
    params.append('limit', String(Math.max(1, filters.limit || 500)))

    return params.toString()
  }

  const getPeriods = async () => {
    if (isLoading()) return

    setIsLoading(true)
    try {
      const queryParams = buildQueryParams(filter())
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/special-periods?${queryParams}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des périodes spéciales')
      }

      const data = await response.json()

      // Si l'API retourne un objet avec pagination
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const responseData = data as {
          periods?: SpecialPeriod[]
          special_periods?: SpecialPeriod[]
          totalPages?: number
          total_pages?: number
          page?: number
          current_page?: number
          currentPage?: number
          total?: number
        }

        // Support des deux formats possibles (periods ou special_periods)
        const periodsData = responseData.periods ?? responseData.special_periods
        setPeriods(Array.isArray(periodsData) ? periodsData : [])

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
        // Si l'API retourne directement un tableau
        setPeriods(Array.isArray(data) ? data : [])
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les périodes spéciales.')
      console.error(error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const updateFilter = (newFilter: Partial<SpecialPeriodsFilter>, immediate = false) => {
    setFilter(prev => {
      const updated = { ...prev, ...newFilter }
      // Réinitialiser la page à 1 si on change un filtre autre que la page
      if (newFilter.page === undefined && Object.keys(newFilter).length > 0) {
        updated.page = 1
      }

      // Mettre à jour l'URL
      updateURL({
        type: updated.type,
        date: updated.date,
        zone: updated.zone,
        is_active: updated.is_active !== undefined ? String(updated.is_active) : undefined,
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
      void getPeriods()
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
      void getPeriods()
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
      type: undefined,
      date: undefined,
      zone: undefined,
      is_active: undefined,
      page: 1,
      limit: 500
    })

    // Appel immédiat pour reset
    void getPeriods()
  }

  const createPeriod = async (data: CreatePeriodData) => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/special-periods`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la création de la période spéciale')
      }

      toast.success('Succès', 'Période spéciale créée avec succès')
      void getPeriods()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création de la période spéciale'
      toast.error('Erreur', message)
      throw error
    }
  }

  const updatePeriod = async (id: string, data: UpdatePeriodData) => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/special-periods/${id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la mise à jour de la période spéciale')
      }

      toast.success('Succès', 'Période spéciale mise à jour avec succès')
      void getPeriods()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la période spéciale'
      toast.error('Erreur', message)
      throw error
    }
  }

  const deletePeriod = async (id: string) => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/special-periods/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la suppression de la période spéciale')
      }

      toast.success('Succès', 'Période spéciale supprimée avec succès')
      void getPeriods()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la suppression de la période spéciale'
      toast.error('Erreur', message)
      throw error
    }
  }

  onMount(() => {
    // Premier fetch immédiat au montage
    void getPeriods()
  })

  return {
    isFetching,
    periods,
    isLoading,
    filter,
    totalPages,
    currentPage,
    setFilter: updateFilter,
    getPeriods,
    resetFilters,
    createPeriod,
    updatePeriod,
    deletePeriod
  }
}

