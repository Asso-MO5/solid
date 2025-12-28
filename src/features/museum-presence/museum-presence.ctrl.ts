import { createMemo, createSignal, onMount } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import { auth } from "~/features/auth/auth.store"
import { useCan } from "~/features/auth/can.ctrl"
import type { MuseumPresenceCtrlReturn, MuseumPresenceDay } from "./museum-presence.types"

export const useMuseumPresence = (): MuseumPresenceCtrlReturn => {
  const [days, setDays] = createSignal<MuseumPresenceDay[]>([])
  const [isFetching, setIsFetching] = createSignal<boolean>(true)
  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [error, setError] = createSignal<string | null>(null)
  const canAdmin = useCan({ bureau: true })

  // Grouper les jours par semaine
  const weeks = createMemo(() => {
    const daysList = days()
    const weeksList: MuseumPresenceDay[][] = []
    let currentWeek: MuseumPresenceDay[] = []

    daysList.forEach((day, index) => {
      currentWeek.push(day)

      // Si c'est dimanche (index 6) ou le dernier jour, terminer la semaine
      const date = new Date(day.date)
      const dayOfWeek = date.getDay()

      if (dayOfWeek === 0 || index === daysList.length - 1) {
        weeksList.push([...currentWeek])
        currentWeek = []
      }
    })

    return weeksList
  })

  // Calculer les dates pour les prochaines 4 semaines
  const getWeeksRange = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Commencer au lundi de la semaine actuelle
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    // 4 semaines = 28 jours
    const endDate = new Date(monday)
    endDate.setDate(monday.getDate() + 27)

    return {
      start: monday.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  }

  const fetchPresences = async () => {
    setError(null)

    try {
      const range = getWeeksRange()
      const params = new URLSearchParams({
        start_date: range.start,
        end_date: range.end
      })

      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/member-presences?${params.toString()}`,
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
      const userId = auth?.id

      // Transformer les données
      const transformedDays: MuseumPresenceDay[] = []

      if (data.days && Array.isArray(data.days)) {
        data.days.forEach((day: { date: string, day_name: string, is_open: boolean, presences: { id: string, user_id: string, user_name: string, period: 'afternoon', refused_by_admin: boolean }[] }) => {
          const myPresence = day.presences?.find((p: { user_id: string }) => p.user_id === userId)
          const allPresences = day.presences || []

          transformedDays.push({
            date: day.date,
            day_name: day.day_name || '',
            is_open: day.is_open !== false, // Par défaut ouvert si non spécifié
            my_presence: myPresence ? {
              id: myPresence.id,
              period: 'afternoon' as const,
              refused: myPresence.refused_by_admin || false
            } : undefined,
            all_presences: allPresences.map((p: { id: string, user_id: string, user_name: string, period: 'afternoon', refused_by_admin: boolean }) => ({
              id: p.id,
              user_id: p.user_id,
              user_name: p.user_name,
              period: 'afternoon' as const,
              refused: p.refused_by_admin || false
            }))
          })
        })
      }

      // Si on n'a pas tous les jours, les générer
      const allDays: MuseumPresenceDay[] = []
      const startDate = new Date(range.start)
      const endDate = new Date(range.end)

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
        const existingDay = transformedDays.find(day => day.date === dateStr)

        if (existingDay) {
          allDays.push(existingDay)
        } else {
          // Créer un jour vide
          const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
          allDays.push({
            date: dateStr,
            day_name: dayNames[d.getDay()],
            is_open: true, // Par défaut ouvert
            my_presence: undefined,
            all_presences: canAdmin() ? [] : undefined
          })
        }
      }

      setDays(allDays)
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(msg)
      toast.error('Erreur', msg)
    } finally {
      setIsFetching(false)
    }
  }

  const togglePresence = async (date: string) => {
    setIsLoading(true)

    const day = days().find(d => d.date === date)
    if (!day) return

    try {
      if (day?.my_presence?.id) {
        const response = await fetch(
          `${clientEnv.VITE_OCELOT_URL}/museum/member-presences/${day.my_presence.id}`,
          {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

      } else {

        const response = await fetch(
          `${clientEnv.VITE_OCELOT_URL}/museum/member-presences`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date,
              period: 'afternoon'
            }),
          }
        )

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
      }

      await fetchPresences()
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      toast.error('Erreur', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRefuse = async (presenceId: string, refused: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/museum/member-presences/${presenceId}/refuse`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refused
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      toast.success(refused ? 'Présence refusée' : 'Présence acceptée', 'La présence a été mise à jour.')

      // Recharger les données
      await fetchPresences()
    } catch (err) {
      const msg = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Une erreur est survenue'
      toast.error('Erreur', msg)
    } finally {
      setIsLoading(false)
    }
  }

  onMount(() => {
    fetchPresences()
  })

  return {
    weeks,
    isLoading,
    error,
    togglePresence,
    toggleRefuse,
    refresh: fetchPresences,
    isFetching,
  }
}

