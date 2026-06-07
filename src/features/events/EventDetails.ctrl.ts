import { createSignal, type Accessor } from "solid-js"
import { useNavigate } from "@solidjs/router"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"
import { clientEnv } from "~/env/client"

const [selectedEvent, setSelectedEvent] = createSignal<CalendarEvent | null>(null)
const [isOpen, setIsOpen] = createSignal(false)

export async function deleteEventById(id: string): Promise<void> {
  const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/events/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message || `Erreur HTTP ${response.status}`)
  }
}

export function EventDetailsCtrl() {
  const navigate = useNavigate()

  const openEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsOpen(true)
  }

  const closeEvent = () => {
    setIsOpen(false)
    setSelectedEvent(null)
  }

  const viewEvent = (event: CalendarEvent) => {
    navigate(`/admin/cal/${event.id}`)
    closeEvent()
  }

  const deleteEvent = (event: CalendarEvent) => {
    console.log('Delete event:', event.id)
    closeEvent()
  }

  const duplicateEvent = (event: CalendarEvent) => {
    console.log('Duplicate event:', event.id)
    closeEvent()
  }

  return {
    selectedEvent: selectedEvent as Accessor<CalendarEvent | null>,
    isOpen: isOpen as Accessor<boolean>,
    openEvent,
    closeEvent,
    viewEvent,
    deleteEvent,
    duplicateEvent
  }
}
