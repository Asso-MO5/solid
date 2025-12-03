import { For, Show } from "solid-js"
import type { TicketsCtrlReturn } from "./tickets.types"
import type { Ticket } from "../entries/entries.types"

interface TicketsTableProps {
  ctrl: TicketsCtrlReturn
}

export const TicketsTable = (props: TicketsTableProps) => {
  const getStatusLabel = (status: Ticket['status']) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'used':
        return 'Utilisé'
      case 'cancelled':
        return 'Annulé'
      case 'refunded':
        return 'Remboursé'
      default:
        return status
    }
  }


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getTicketTypeName = (ticket: Ticket) => {
    if (ticket.notes?.pricing_info?.translations?.fr?.name) {
      return ticket.notes.pricing_info.translations.fr.name
    }
    return ticket.ticket_type || '--'
  }

  return (
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">QR Code</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prix</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date réservation</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Horaires</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Créé le</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Validé le</th>
          </tr>
        </thead>
        <tbody>
          <Show
            when={props.ctrl.tickets().length > 0}
            fallback={
              <tr>
                <td colSpan={11} class="px-4 py-8 text-center text-gray-500">
                  <Show
                    when={props.ctrl.isLoading()}
                    fallback="Aucun billet trouvé"
                  >
                    Chargement...
                  </Show>
                </td>
              </tr>
            }
          >
            <For each={props.ctrl.tickets()}>
              {(ticket) => (
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3">
                    {ticket.first_name || '--'} {ticket.last_name || ''}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    {ticket.email || '--'}
                  </td>
                  <td class="px-4 py-3 font-mono text-xs">
                    {ticket.qr_code}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    {getTicketTypeName(ticket)}
                  </td>
                  <td class="px-4 py-3 text-sm font-medium">
                    {formatPrice(ticket.ticket_price)}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      data-status={ticket.status}
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    {formatDate(ticket.reservation_date)}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <Show
                      when={ticket.slot_start_time && ticket.slot_end_time}
                      fallback="--"
                    >
                      {ticket.slot_start_time} - {ticket.slot_end_time}
                    </Show>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(ticket.created_at)}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(ticket.used_at)}
                  </td>
                </tr>
              )}
            </For>
          </Show>
        </tbody>
      </table>
    </div>
  )
}

