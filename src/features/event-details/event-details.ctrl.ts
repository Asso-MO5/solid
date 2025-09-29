import { createSignal } from "solid-js"
import { useNavigate } from "@solidjs/router"
import type { EventDetailsData } from "./event-details.types"

/**
 * Hook pour les détails d'événement
 * Gère la logique d'affichage des détails d'événement
 */
export function useEventDetails() {
  const [event, setEvent] = createSignal<EventDetailsData | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [isOpen, setIsOpen] = createSignal(false)
  const navigate = useNavigate()

  const openEvent = (eventData: EventDetailsData) => {
    setEvent(eventData)
    setIsOpen(true)
    setError(null)
  }

  const closeEvent = () => {
    setIsOpen(false)
    setEvent(null)
    setError(null)
  }

  const loadEvent = async (eventId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found')
        }
        if (response.status === 403) {
          throw new Error('Access denied')
        }
        throw new Error('Failed to fetch event')
      }

      const eventData = await response.json()
      setEvent(eventData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const viewEvent = (eventData: EventDetailsData) => {
    navigate(`/admin/cal/${eventData.id}`)
    closeEvent()
  }

  const deleteEvent = (eventData: EventDetailsData) => {
    // TODO: Implémenter la suppression
    console.log('Delete event:', eventData.id)
    closeEvent()
  }

  const duplicateEvent = (eventData: EventDetailsData) => {
    // TODO: Implémenter la duplication
    console.log('Duplicate event:', eventData.id)
    closeEvent()
  }

  return {
    event,
    loading,
    error,
    isOpen,
    openEvent,
    closeEvent,
    loadEvent,
    viewEvent,
    deleteEvent,
    duplicateEvent
  }
}