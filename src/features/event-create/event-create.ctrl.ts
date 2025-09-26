import { createSignal } from "solid-js"
import type { EventCreateData } from "./event-create.types"

/**
 * Hook pour la création d'événement
 * Gère la logique de création d'événement
 */
export function useEventCreate(onEventCreated?: () => void) {
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)
  const [isOpen, setIsOpen] = createSignal(false)
  const [selectedDate, setSelectedDate] = createSignal<Date | null>(null)
  const [currentView, setCurrentView] = createSignal<'month' | 'week' | 'day' | 'list'>('month')

  const openCreateModal = (date?: Date, view?: 'month' | 'week' | 'day' | 'list') => {
    if (date) setSelectedDate(date)
    if (view) setCurrentView(view)
    setIsOpen(true)
    setError(null)
  }

  const closeCreateModal = () => {
    setIsOpen(false)
    setSelectedDate(null)
    setError(null)
  }

  const createEvent = async (eventData: EventCreateData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const newEvent = await response.json()

      // Notifier le parent
      onEventCreated?.()

      // Fermer le modal
      closeCreateModal()

      return newEvent
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    isOpen,
    selectedDate,
    currentView,
    openCreateModal,
    closeCreateModal,
    createEvent
  }
}