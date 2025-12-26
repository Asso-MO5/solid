import { Show } from "solid-js"

interface TicketResendModalProps {
  checkoutId: string
  ticketCount?: number
  onConfirm: () => Promise<void>
  onCancel: () => void
  isResending: boolean
}

export const TicketResendModal = (props: TicketResendModalProps) => {
  return (
    <div>
      <div class="mb-6">
        <p class="text-gray-700 mb-2">
          Êtes-vous sûr de vouloir renvoyer les billets pour ce checkout ?
        </p>
        <Show when={props.ticketCount !== undefined}>
          <p class="text-sm text-gray-600">
            {props.ticketCount} billet{props.ticketCount !== 1 ? 's' : ''} ser{props.ticketCount !== 1 ? 'ont' : 'a'} renvoyé{props.ticketCount !== 1 ? 's' : ''}.
          </p>
        </Show>
        <p class="text-xs text-gray-500 mt-2">
          Checkout ID : <span class="font-mono break-all">{props.checkoutId}</span>
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => props.onCancel()}
          disabled={props.isResending}
          class="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() => void props.onConfirm()}
          disabled={props.isResending}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
        >
          {props.isResending ? 'Envoi...' : 'Confirmer le renvoi'}
        </button>
      </div>
    </div>
  )
}

