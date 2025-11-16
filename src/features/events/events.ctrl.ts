import { createSignal, onMount } from "solid-js"
import type { Event } from "~/database/schema"
import { ToastCtrl } from "~/ui/Toast"
import type { EventCategory, EventStatus, AvailableRole } from "./events.const"

// Types locaux pour la feature events
export type CalendarView = 'month' | 'week' | 'day' | 'list'

export interface EventCreateData {
  title: string
  description?: string
  category: EventCategory
  status?: EventStatus
  startDate: string
  endDate: string
  allowedRoles?: AvailableRole[]
  isConfidential?: boolean
}

export const EventsCtrl = () => {
  const toast = ToastCtrl()
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [events, setEvents] = createSignal<Event[]>([])

  // Cache pour éviter les requêtes en double
  let lastRequestParams: string | null = null

  // Fonction pour calculer la plage de dates selon la vue
  const getDateRange = (view: CalendarView, selectedDate: Date) => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)

    switch (view) {
      case 'month':
        // Mois courant + 1 mois avant/après
        start.setMonth(start.getMonth() - 1, 1)
        end.setMonth(end.getMonth() + 2, 0) // Dernier jour du mois suivant
        break
      case 'week':
        // Semaine courante + 1 semaine avant/après
        const dayOfWeek = start.getDay()
        const monday = new Date(start)
        monday.setDate(start.getDate() - dayOfWeek + 1)
        start.setTime(monday.getTime() - 7 * 24 * 60 * 60 * 1000) // -1 semaine
        end.setTime(monday.getTime() + 20 * 24 * 60 * 60 * 1000) // +3 semaines
        break
      case 'day':
        // Jour courant + 3 jours avant/après
        start.setDate(start.getDate() - 3)
        end.setDate(end.getDate() + 3)
        break
      case 'list':
        // Mois courant + 1 mois avant/après (comme month)
        start.setMonth(start.getMonth() - 1, 1)
        end.setMonth(end.getMonth() + 2, 0)
        break
    }

    return {
      start: start.toISOString().split('T')[0], // Format YYYY-MM-DD
      end: end.toISOString().split('T')[0]
    }
  }

  const getEvents = async (view?: CalendarView, selectedDate?: Date) => {
    // Éviter les appels inutiles si pas de paramètres
    if (!view || !selectedDate) {
      console.log('Skipping getEvents: missing view or date')
      return
    }

    // Construire l'URL avec les paramètres de date
    const dateRange = getDateRange(view, selectedDate)
    const params = new URLSearchParams({
      start: dateRange.start,
      end: dateRange.end
    })
    const url = `/api/events?${params.toString()}`
    const requestKey = `${view}-${dateRange.start}-${dateRange.end}`

    // Éviter les requêtes en double
    if (lastRequestParams === requestKey) {
      return
    }

    lastRequestParams = requestKey

    setLoading(true)
    setError(null)
    try {

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const eventsData = await response.json()

      // Convertir les chaînes de dates en objets Date
      const eventsWithDates = eventsData.map((event: Event) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate)
      }))

      setEvents(eventsWithDates)
    } catch (error) {
      const msg = typeof error === 'string' ? error : error instanceof Error ? error.message : 'Une erreur est survenue'
      toast.error('Erreur', msg)
    }
    finally {
      setLoading(false)
    }
  }

  const createEvent = async (event: EventCreateData) => {

    setLoading(true)
    setError(null)
    try {
      await fetch(`/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
      getEvents()

    } catch (error) {
      setError(typeof error === 'string' ? error : error instanceof Error ? error.message : 'Une erreur est survenue')
      toast.error('Erreur', 'Une erreur est survenue')
    }
    finally {
      setLoading(false)
    }

  }

  onMount(() => {
    getEvents()
  })

  return {
    getEvents,
    createEvent,
    events,
    loading,
    error
  }
}