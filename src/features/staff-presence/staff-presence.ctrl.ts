import { createMemo, createSignal, onMount } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import { getAllURLParams, updateURL } from "~/utils/url-sync"
import { auth } from "~/features/auth/auth.store"
import type { StaffPresenceCtrlReturn, StaffPresenceFilter, StaffPresenceDayApi, CreatePresenceData, UpdatePresenceData, StaffPresence, StaffPresenceApi } from "./staff-presence.types"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"

export const useStaffPresence = (): StaffPresenceCtrlReturn => {
  const [presences, setPresences] = createSignal<StaffPresence[]>([])
  const [days, setDays] = createSignal<StaffPresenceDayApi[]>([])
  const [isFetching, setIsFetching] = createSignal<boolean>(true)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [error, setError] = createSignal<string | null>(null)

  // Initialiser les filtres depuis l'URL
  const getInitialFilter = (): StaffPresenceFilter => {
    const urlParams = getAllURLParams()
    return {
      start_date: urlParams.start_date || undefined,
      end_date: urlParams.end_date || undefined,
      view: (urlParams.view as 'month' | 'week' | 'day' | 'list') || 'month',
      period: urlParams.period as 'morning' | 'afternoon' | 'both' || undefined,
      member_id: urlParams.member_id || undefined,
      refused: urlParams.refused === 'true' ? true : urlParams.refused === 'false' ? false : undefined,
    }
  }

  const [filter, setFilter] = createSignal<StaffPresenceFilter>(getInitialFilter())

  // Fonction pour calculer la plage de dates selon la vue
  const getDateRange = (view: 'month' | 'week' | 'day' | 'list', selectedDate: Date) => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)

    switch (view) {
      case 'month': {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        start.setFullYear(year, month, 1)
        start.setHours(0, 0, 0, 0)
        // Dernier jour du mois
        end.setFullYear(year, month + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
      }
      case 'week': {
        const dayOfWeek = start.getDay() === 0 ? 7 : start.getDay()
        const monday = new Date(start)
        monday.setDate(start.getDate() - dayOfWeek + 1)
        monday.setHours(0, 0, 0, 0)
        start.setTime(monday.getTime())
        // Dimanche de la semaine
        end.setTime(monday.getTime())
        end.setDate(monday.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
      }
      case 'day':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'list': {
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        start.setFullYear(year, month, 1)
        start.setHours(0, 0, 0, 0)
        // Dernier jour du mois
        end.setFullYear(year, month + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
      }
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    }
  }

  const buildQueryParams = (filters: StaffPresenceFilter, view?: 'month' | 'week' | 'day' | 'list', selectedDate?: Date): string => {
    const params = new URLSearchParams()

    // Si on a view et selectedDate, calculer les dates
    if (view && selectedDate) {
      const dateRange = getDateRange(view, selectedDate)
      params.append('start_date', dateRange.start)
      // Toujours envoyer end_date pour mois et semaine
      if (view === 'month' || view === 'week' || view === 'list') {
        params.append('end_date', dateRange.end)
      } else if (dateRange.end !== dateRange.start) {
        // Pour day, on envoie seulement si différent
        params.append('end_date', dateRange.end)
      }
    } else {
      // Sinon utiliser les filtres
      // Si start_date est défini, l'envoyer
      if (filters.start_date) {
        params.append('start_date', filters.start_date)
        // Si end_date est défini, l'envoyer aussi (même si c'est la même date)
        if (filters.end_date) {
          params.append('end_date', filters.end_date)
        }
      }
      // Si pas de start_date, ne rien envoyer (pas de filtre de date)
    }

    // Les autres filtres ne sont pas dans l'API, on les garde pour le filtrage côté client si besoin
    // if (filters.period) params.append('period', filters.period)
    // if (filters.member_id) params.append('member_id', filters.member_id)
    // if (filters.refused !== undefined) params.append('refused', String(filters.refused))

    return params.toString()
  }

  const getPresences = async (view?: 'month' | 'week' | 'day' | 'list', selectedDate?: Date) => {
    if (isLoading()) return

    setIsLoading(true)
    setIsFetching(true)
    setError(null)

    try {
      const currentFilter = filter()
      const queryParams = buildQueryParams(currentFilter, view, selectedDate)
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/member-presences?${queryParams}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      // Transformer les données de l'API
      const allPresences: StaffPresence[] = []
      const daysData: StaffPresenceDayApi[] = []

      if (data.days && Array.isArray(data.days)) {
        data.days.forEach((day: { date: string; day_name: string; presences: StaffPresenceApi[] }) => {
          const transformedPresences: StaffPresence[] = (day.presences || []).map((presence: StaffPresenceApi) => ({
            id: presence.id,
            user_id: presence.user_id,
            user_name: presence.user_name,
            date: presence.date,
            period: presence.period,
            refused: presence.refused_by_admin,
            created_at: presence.created_at,
            updated_at: presence.updated_at,
          }))

          // Appliquer les filtres côté client
          let filteredPresences = transformedPresences

          if (currentFilter.period) {
            filteredPresences = filteredPresences.filter(p => p.period === currentFilter.period)
          }

          if (currentFilter.member_id) {
            filteredPresences = filteredPresences.filter(p => p.user_id === currentFilter.member_id)
          }

          if (currentFilter.refused !== undefined) {
            filteredPresences = filteredPresences.filter(p => p.refused === currentFilter.refused)
          }

          if (filteredPresences.length > 0) {
            daysData.push({
              date: day.date,
              day_name: day.day_name || '',
              presences: filteredPresences,
            })

            allPresences.push(...filteredPresences)
          }
        })
      }

      setPresences(allPresences)
      setDays(daysData)
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(msg)
      toast.error('Erreur', msg)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  const updateFilter = (updates: Partial<StaffPresenceFilter>, updateURLParam = false) => {
    const newFilter = { ...filter(), ...updates }
    setFilter(newFilter)

    if (updateURLParam) {
      const params: Record<string, string> = {}
      if (newFilter.start_date) params.start_date = newFilter.start_date
      if (newFilter.end_date) params.end_date = newFilter.end_date
      if (newFilter.view) params.view = newFilter.view
      if (newFilter.period) params.period = newFilter.period
      if (newFilter.member_id) params.member_id = newFilter.member_id
      if (newFilter.refused !== undefined) params.refused = String(newFilter.refused)
      updateURL(params)
    }
  }

  const resetFilters = () => {
    const defaultFilter: StaffPresenceFilter = {
      view: 'month',
    }
    setFilter(defaultFilter)
    updateURL({})
    // Recharger les données
    getPresences(defaultFilter.view, new Date())
  }

  const createPresence = async (data: CreatePresenceData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/member-presences`,
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
        throw new Error('Erreur lors de la création de la présence')
      }

      toast.success('Succès', 'Présence créée avec succès')
      // Recharger les données
      await getPresences(filter().view, new Date())
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(msg)
      toast.error('Erreur', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePresence = async (id: string, data: UpdatePresenceData) => {
    setIsLoading(true)
    setError(null)
    try {
      // Si on met à jour seulement la période, utiliser PATCH sur l'endpoint principal
      // Si on met à jour le statut refused, utiliser PUT sur /refuse
      if (data.refused !== undefined) {
        const response = await fetch(
          `${clientEnv.VITE_OCELOT_URL}/museum/member-presences/${id}/refuse`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refused: data.refused }),
          }
        )

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du statut de la présence')
        }
      } else if (data.period) {
        // Pour mettre à jour la période, on peut utiliser POST (qui crée ou met à jour)
        const currentPresence = presences().find(p => p.id === id)
        if (currentPresence) {
          const response = await fetch(
            `${clientEnv.VITE_OCELOT_URL}/museum/member-presences`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                date: currentPresence.date,
                period: data.period,
              }),
            }
          )

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour de la présence')
          }
        }
      }

      toast.success('Succès', 'Présence mise à jour avec succès')
      // Recharger les données
      await getPresences(filter().view, new Date())
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(msg)
      toast.error('Erreur', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const deletePresence = async (id: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/member-presences/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la présence')
      }

      toast.success('Succès', 'Présence supprimée avec succès')
      // Recharger les données
      await getPresences(filter().view, new Date())
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(msg)
      toast.error('Erreur', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRefuse = async (id: string, refused: boolean) => {
    await updatePresence(id, { refused })
  }

  // Transformer les présences en CalendarEvent pour l'affichage dans le calendrier
  const presencesAsEvents = createMemo((): CalendarEvent[] => {
    const presencesList = presences()
    if (presencesList.length === 0) {
      return []
    }

    return presencesList.map((presence) => {
      const periodLabels: Record<string, string> = {
        morning: 'Matin',
        afternoon: 'Après-midi',
        both: 'Journée complète',
      }

      // Parser la date correctement (format YYYY-MM-DD)
      const dateStr = presence.date
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day, 0, 0, 0, 0)

      // Ne pas afficher le nom si c'est l'utilisateur connecté
      const isCurrentUser = auth.id === presence.user_id
      const userName = isCurrentUser ? '' : `${presence.user_name} - `

      return {
        id: `presence-${presence.id}`,
        title: presence.refused
          ? `❌ ${userName}${periodLabels[presence.period] || presence.period} (Refusé)`
          : `✓ ${userName}${periodLabels[presence.period] || presence.period}`,
        description: `Présence ${presence.refused ? 'refusée' : 'acceptée'}`,
        startDate: date,
        endDate: date,
        category: 'other',
        status: presence.refused ? 'cancelled' : 'published',
        color: presence.refused ? '#ef4444' : '#10b981', // Rouge si refusé, vert si accepté
      }
    })
  })

  // Charger les données au montage
  onMount(() => {
    const currentFilter = filter()
    if (currentFilter.view) {
      getPresences(currentFilter.view, new Date())
    }
  })

  return {
    presences,
    days,
    isLoading,
    isFetching,
    error,
    filter,
    setFilter: updateFilter,
    resetFilters,
    getPresences,
    createPresence,
    updatePresence,
    deletePresence,
    toggleRefuse,
    presencesAsEvents,
  }
}

