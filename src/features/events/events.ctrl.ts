import { createSignal } from "solid-js"
import { ToastCtrl } from "~/ui/Toast"
import type { EventCategory, EventStatus, AvailableRole } from "./events.const"
import { clientEnv } from "~/env/client"
import type { CalendarResponse, CalendarEventApi } from "./events.types"
import type { CalendarEvent, CalendarDayInfo } from "~/ui/Cal/Cal.types"
import { getCategoryColor } from "./events.utils"

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
  const [events, setEvents] = createSignal<CalendarEvent[]>([])
  const [calendarDays, setCalendarDays] = createSignal<Map<string, CalendarDayInfo>>(new Map())

  // Cache pour éviter les requêtes en double
  let lastRequestParams: string | null = null

  // Fonction pour calculer la plage de dates selon la vue
  const getDateRange = (view: CalendarView, selectedDate: Date) => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)

    switch (view) {
      case 'month': {
        // L'API gère automatiquement les jours avant/après, on envoie juste le premier jour du mois
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        start.setFullYear(year, month, 1)
        // L'API retournera les jours nécessaires, on peut mettre la même date pour end
        end.setFullYear(year, month, 1)
        break
      }
      case 'week': {
        // Semaine courante : remonter au lundi
        const dayOfWeek = start.getDay() === 0 ? 7 : start.getDay()
        const monday = new Date(start)
        monday.setDate(start.getDate() - dayOfWeek + 1)
        start.setTime(monday.getTime())
        // Fin : dimanche de la semaine
        end.setTime(monday.getTime())
        end.setDate(monday.getDate() + 6)
        break
      }
      case 'day':
        // Jour courant uniquement
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'list': {
        // Mois courant : du 1er au dernier jour du mois
        const year = selectedDate.getFullYear()
        const month = selectedDate.getMonth()
        start.setFullYear(year, month, 1)
        end.setFullYear(year, month + 1, 0) // Dernier jour du mois
        break
      }
    }

    return {
      start: start.toISOString().split('T')[0], // Format YYYY-MM-DD
      end: end.toISOString().split('T')[0]
    }
  }

  // Transformer un événement de l'API en CalendarEvent
  const transformEvent = (apiEvent: CalendarEventApi): CalendarEvent => {
    // Construire la date de début avec l'heure si disponible
    const startDateStr = apiEvent.start_date
    const startTimeStr = apiEvent.start_time || '00:00:00'
    const startDateTime = `${startDateStr}T${startTimeStr}`

    // Construire la date de fin avec l'heure si disponible
    const endDateStr = apiEvent.end_date
    const endTimeStr = apiEvent.end_time || '23:59:59'
    const endDateTime = `${endDateStr}T${endTimeStr}`

    // Utiliser le titre français par défaut, ou anglais si français non disponible
    const title = apiEvent.public_title_fr || apiEvent.public_title_en || 'Sans titre'
    const description = apiEvent.public_description_fr || apiEvent.public_description_en || undefined

    return {
      id: apiEvent.id,
      title,
      description,
      startDate: new Date(startDateTime),
      endDate: new Date(endDateTime),
      category: apiEvent.category as CalendarEvent['category'],
      status: apiEvent.status as CalendarEvent['status'],
      color: getCategoryColor(apiEvent.category),
      // Les autres champs peuvent être ajoutés si nécessaire
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
      start_date: dateRange.start,
      end_date: dateRange.end,
      view: view
    })
    const url = `${clientEnv.VITE_OCELOT_URL}/museum/calendar?${params.toString()}`
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const calendarData: CalendarResponse = await response.json()



      // Extraire tous les événements de tous les jours
      const allEvents: CalendarEvent[] = []
      const daysMap = new Map<string, CalendarDayInfo>()

      calendarData.days.forEach(day => {
        // Transformer et stocker les informations du jour
        const dayInfo: CalendarDayInfo = {
          is_open: day.is_open,
          opening_hours: day.opening_hours,
          holiday_periods: day.holiday_periods,
          closure_periods: day.closure_periods
          paid_tickets_count: day.paid_tickets_count,
        }
        daysMap.set(day.date, dayInfo)

        // Extraire les événements
        day.events.forEach(apiEvent => {
          allEvents.push(transformEvent(apiEvent))
        })
      })

      setEvents(allEvents)
      setCalendarDays(daysMap)
    } catch (error) {
      const msg = typeof error === 'string' ? error : error instanceof Error ? error.message : 'Une erreur est survenue'
      setError(msg)
      toast.error('Erreur', msg)
    }
    finally {
      setLoading(false)
    }
  }

  const createEvent = async (event: EventCreateData, view?: CalendarView, selectedDate?: Date) => {
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
      // Recharger les événements après création
      if (view && selectedDate) {
        await getEvents(view, selectedDate)
      }
    } catch (error) {
      setError(typeof error === 'string' ? error : error instanceof Error ? error.message : 'Une erreur est survenue')
      toast.error('Erreur', 'Une erreur est survenue')
    }
    finally {
      setLoading(false)
    }
  }

  return {
    getEvents,
    createEvent,
    events,
    calendarDays,
    loading,
    error
  }
}