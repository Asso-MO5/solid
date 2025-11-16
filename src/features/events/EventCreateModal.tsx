import { createEffect } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { EventCreateForm } from "./EventCreateForm"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"

interface EventCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: (event: CalendarEvent) => void
  selectedDate?: Date | null
  currentView?: 'month' | 'week' | 'day' | 'list'
}

export const EventCreateModal = (props: EventCreateModalProps) => {
  const modal = ModalCtrl()

  createEffect(() => {
    if (props.isOpen) {
      modal.open({
        title: 'Créer un événement',
        content: (
          <EventCreateForm
            onEventCreated={(event) => {
              props.onEventCreated?.(event)
              props.onClose() // Fermer le modal après création
            }}
            onClose={props.onClose}
            selectedDate={props.selectedDate}
            currentView={props.currentView}
          />
        ),
        size: 'xl',
        closable: true,
        onClose: props.onClose
      })
    } else {
      // Fermer le modal UI quand isOpen devient false
      modal.close()
    }
  })

  return null
}