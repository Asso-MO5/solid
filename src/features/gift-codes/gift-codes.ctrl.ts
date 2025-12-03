import { createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import { getAllURLParams, updateURL } from "~/utils/url-sync"
import type { GiftCodesCtrlReturn, GiftCodesFilter, GiftCodePack, CreatePackData, DistributePackData } from "./gift-codes.types"

export const useGiftCodes = (): GiftCodesCtrlReturn => {
  const [packs, setPacks] = createSignal<GiftCodePack[]>([])
  const [isFetching, setIsFetching] = createSignal<boolean>(true)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [totalPages, setTotalPages] = createSignal<number>(1)
  const [currentPage, setCurrentPage] = createSignal<number>(1)

  // Initialiser les filtres depuis l'URL
  const getInitialFilter = (): GiftCodesFilter => {
    const urlParams = getAllURLParams()
    return {
      code: urlParams.code || undefined,
      page: urlParams.page ? parseInt(urlParams.page, 10) : 1,
      limit: urlParams.limit ? parseInt(urlParams.limit, 10) : 50
    }
  }

  const [filter, setFilter] = createSignal<GiftCodesFilter>(getInitialFilter())

  // Debounce timer
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const buildQueryParams = (filters: GiftCodesFilter): string => {
    const params = new URLSearchParams()

    if (filters.code) params.append('code', filters.code)
    params.append('page', String(Math.max(1, filters.page || 1)))
    params.append('limit', String(Math.max(1, filters.limit || 50)))

    return params.toString()
  }

  const getPacks = async () => {
    if (isLoading()) return

    setIsLoading(true)
    try {
      const queryParams = buildQueryParams(filter())
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/gift-codes/packs?${queryParams}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des packs')
      }

      const data = await response.json()

      // Si l'API retourne un objet avec pagination
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const responseData = data as {
          packs?: GiftCodePack[]
          totalPages?: number
          total_pages?: number
          page?: number
          current_page?: number
          currentPage?: number
          total?: number
        }

        setPacks(Array.isArray(responseData.packs) ? responseData.packs : [])

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
        setPacks(Array.isArray(data) ? data : [])
        setTotalPages(1)
        setCurrentPage(1)
      }
    } catch (error) {
      toast.error('Erreur', 'Impossible de charger les packs.')
      console.error(error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const updateFilter = (newFilter: Partial<GiftCodesFilter>, immediate = false) => {
    setFilter(prev => {
      const updated = { ...prev, ...newFilter }
      // Réinitialiser la page à 1 si on change un filtre autre que la page
      if (newFilter.page === undefined && Object.keys(newFilter).length > 0) {
        updated.page = 1
      }

      // Mettre à jour l'URL
      updateURL({
        code: updated.code,
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
      void getPacks()
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
      void getPacks()
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
      limit: 50
    }
    setFilter(resetFilter)

    // Mettre à jour l'URL
    updateURL({
      code: undefined,
      page: 1,
      limit: 50
    })

    // Appel immédiat pour reset
    void getPacks()
  }

  const createPack = async (data: CreatePackData) => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/gift-codes/packs`,
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
        throw new Error(errorData.message || 'Erreur lors de la création du pack')
      }

      toast.success('Succès', 'Pack créé avec succès')
      void getPacks()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la création du pack'
      toast.error('Erreur', message)
      throw error
    }
  }

  const distributePack = async (packId: string, data: DistributePackData) => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/gift-codes/distribute`,
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
        throw new Error(errorData.message || 'Erreur lors de la distribution')
      }

      const result = await response.json()
      toast.success('Succès', `${result.codes_sent || 0} code(s) envoyé(s)`)
      void getPacks()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de la distribution'
      toast.error('Erreur', message)
      throw error
    }
  }

  const copyUnusedCodes = (pack: GiftCodePack) => {
    const unusedCodes = pack.codes
      .filter(code => code.status === 'unused')
      .map(code => code.code)
      .join('\n')

    if (unusedCodes) {
      navigator.clipboard.writeText(unusedCodes)
      toast.success('Succès', `${pack.unused_count} code(s) copié(s)`)
    } else {
      toast.error('Erreur', 'Aucun code non utilisé à copier')
    }
  }

  onMount(() => {
    // Premier fetch immédiat au montage
    void getPacks()
  })

  return {
    isFetching,
    packs,
    isLoading,
    filter,
    totalPages,
    currentPage,
    setFilter: updateFilter,
    getPacks,
    resetFilters,
    createPack,
    distributePack,
    copyUnusedCodes
  }
}

