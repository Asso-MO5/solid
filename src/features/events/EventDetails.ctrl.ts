import { createSignal, type Accessor } from "solid-js"
import { useNavigate } from "@solidjs/router"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"

const [selectedEvent, setSelectedEvent] = createSignal<CalendarEvent | null>(null)
const [isOpen, setIsOpen] = createSignal(false)

export function EventDetailsCtrl() {
  const navigate = useNavigate()

  const openEvent = (event: CalendarEvent) => {
    // Toujours ouvrir le modal, que ce soit sur mobile ou desktop
    setSelectedEvent(event)
    setIsOpen(true)
  }

  const closeEvent = () => {
    setIsOpen(false)
    setSelectedEvent(null)
  }



  const viewEvent = (event: CalendarEvent) => {
    // Naviguer vers la page de lecture seule
    navigate(`/admin/cal/${event.id}`)
    closeEvent()
  }

  const deleteEvent = (event: CalendarEvent) => {
    // TODO: Implémenter la suppression
    console.log('Delete event:', event.id)
    closeEvent()
  }

  const duplicateEvent = (event: CalendarEvent) => {
    // TODO: Implémenter la duplication
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
