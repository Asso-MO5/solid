import { createSignal, type Accessor } from "solid-js"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"
import type { EventCreateData } from "./events.ctrl"
import { useToast } from "~/ui/Toast"

const [isCreateModalOpen, setIsCreateModalOpen] = createSignal(false)
const [loading, setLoading] = createSignal(false)
const [selectedDate, setSelectedDate] = createSignal<Date | null>(null)

export function EventCreateCtrl(onRefreshEvents?: () => void) {
  const toast = useToast()

  const openCreateModal = (date?: Date) => {
    setSelectedDate(date || null)
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleSubmit = async (formData: EventCreateData, onEventCreated?: (event: CalendarEvent) => void, onClose?: () => void) => {
    setLoading(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const newEvent = await response.json()
      toast.success('Succès', 'Événement créé avec succès.')
      onEventCreated?.(newEvent)
      onClose?.() // Fermer le modal après création

    } catch (error) {
      toast.error('Erreur', 'Impossible de créer l\'événement.')
    } finally {
      setLoading(false)
    }
  }

  const onEventCreated = () => {
    onRefreshEvents?.()
    closeCreateModal()
  }

  return {
    isCreateModalOpen: isCreateModalOpen as Accessor<boolean>,
    loading: loading as Accessor<boolean>,
    selectedDate: selectedDate as Accessor<Date | null>,
    openCreateModal,
    closeCreateModal,
    handleSubmit,
    onEventCreated
  }
}