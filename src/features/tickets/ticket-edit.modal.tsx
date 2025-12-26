import { createSignal, For, Show } from "solid-js"
import type { Ticket } from "../entries/entries.types"
import type { UpdateTicketData } from "./tickets.types"

interface TicketEditModalProps {
  ticket: Ticket
  onConfirm: (data: UpdateTicketData) => Promise<void>
  onCancel: () => void
}

export const TicketEditModal = (props: TicketEditModalProps) => {
  const ticket = props.ticket
  const initialReservationDate = ticket.reservation_date || ''
  const initialSlotStartTime = ticket.slot_start_time || ''
  const initialSlotEndTime = ticket.slot_end_time || ''
  const initialEmail = ticket.email || ''
  const initialStatus = ticket.status || 'active'

  const [reservationDate, setReservationDate] = createSignal(initialReservationDate)
  const [slotStartTime, setSlotStartTime] = createSignal(initialSlotStartTime)
  const [slotEndTime, setSlotEndTime] = createSignal(initialSlotEndTime)
  const [email, setEmail] = createSignal(initialEmail)
  const [status, setStatus] = createSignal<Ticket['status']>(initialStatus)
  const [isSubmitting, setIsSubmitting] = createSignal(false)

  const hasChanges = () => {
    return (
      reservationDate() !== initialReservationDate ||
      slotStartTime() !== initialSlotStartTime ||
      slotEndTime() !== initialSlotEndTime ||
      email() !== initialEmail ||
      status() !== initialStatus
    )
  }

  const getStatusLabel = (statusValue: Ticket['status']) => {
    switch (statusValue) {
      case 'paid':
        return 'Payé'
      case 'used':
        return 'Utilisé'
      case 'cancelled':
        return 'Annulé'
      case 'refunded':
        return 'Remboursé'
      default:
        return statusValue
    }
  }

  const handleSubmit = async () => {
    if (!hasChanges()) {
      props.onCancel()
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: UpdateTicketData = {}

      if (reservationDate() !== initialReservationDate) {
        updateData.reservation_date = reservationDate()
      }
      if (slotStartTime() !== initialSlotStartTime) {
        updateData.slot_start_time = slotStartTime()
      }
      if (slotEndTime() !== initialSlotEndTime) {
        updateData.slot_end_time = slotEndTime()
      }
      if (email() !== initialEmail) {
        updateData.email = email()
      }
      if (status() !== initialStatus) {
        updateData.status = status()
      }

      await props.onConfirm(updateData)
      props.onCancel()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  const formatTimeForInput = (timeString: string) => {
    if (!timeString) return ''
    return timeString.substring(0, 5)
  }

  return (
    <div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Date de réservation
          </label>
          <input
            type="date"
            value={formatDateForInput(reservationDate())}
            onInput={(e) => setReservationDate(e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Heure de début
            </label>
            <input
              type="time"
              value={formatTimeForInput(slotStartTime())}
              onInput={(e) => setSlotStartTime(e.currentTarget.value + ':00')}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Heure de fin
            </label>
            <input
              type="time"
              value={formatTimeForInput(slotEndTime())}
              onInput={(e) => setSlotEndTime(e.currentTarget.value + ':00')}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>


        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={status()}
            onChange={(e) => setStatus(e.currentTarget.value as Ticket['status'])}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <For each={['paid', 'used', 'cancelled', 'refunded'] as const}>
              {(statusValue) => (
                <option value={statusValue}>{getStatusLabel(statusValue as Ticket['status'])}</option>
              )}
            </For>
          </select>
        </div>


        <Show when={hasChanges()}>
          <div class="mt-4 p-4 bg-secondary/10 border border-secondary rounded-md">
            <h3 class="text-sm font-semibold text-secondary mb-2">Modifications à apporter :</h3>
            <ul class="text-sm text-secondary space-y-1">
              <Show when={reservationDate() !== initialReservationDate}>
                <li>
                  Date : {initialReservationDate.split('T')[0] || '--'} → {reservationDate().split('T')[0] || '--'}
                </li>
              </Show>
              <Show when={slotStartTime() !== initialSlotStartTime}>
                <li>
                  Heure début : {initialSlotStartTime || '--'} → {slotStartTime() || '--'}
                </li>
              </Show>
              <Show when={slotEndTime() !== initialSlotEndTime}>
                <li>
                  Heure fin : {initialSlotEndTime || '--'} → {slotEndTime() || '--'}
                </li>
              </Show>
              <Show when={email() !== initialEmail}>
                <li>
                  Email : {initialEmail || '--'} → {email() || '--'}
                </li>
              </Show>
              <Show when={status() !== initialStatus}>
                <li>
                  Statut : {getStatusLabel(initialStatus)} → {getStatusLabel(status())}
                </li>
              </Show>
            </ul>
          </div>
        </Show>
      </div>


      <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => props.onCancel()}
          disabled={isSubmitting()}
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting() || !hasChanges()}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
        >
          {isSubmitting() ? 'Enregistrement...' : 'Confirmer les modifications'}
        </button>
      </div>
    </div>
  )
}

