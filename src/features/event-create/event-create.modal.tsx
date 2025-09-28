import { createEffect } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { EventCreateForm } from "./event-create.form"
import type { EventCreateFormData } from "./event-create.types"

/**
 * Modal de création d'événement
 * Orchestrateur entre le contrôleur et le formulaire
 */

interface EventCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated?: () => void
  selectedDate?: Date | null
  currentView?: 'month' | 'week' | 'day' | 'list'
  loading: boolean
  onSubmit: (data: EventCreateFormData) => void
}

export const EventCreateModal = (props: EventCreateModalProps) => {
  const modal = ModalCtrl()

  createEffect(() => {
    if (props.isOpen) {
      modal.open({
        title: 'Créer un événement',
        content: (
          <EventCreateForm
            selectedDate={props.selectedDate}
            currentView={props.currentView}
            loading={props.loading}
            onSubmit={props.onSubmit}
            onCancel={props.onClose}
          />
        ),
        size: 'xl',
        closable: true,
        onClose: props.onClose
      })
    } else {
      modal.close()
    }
  })

  return null
}
