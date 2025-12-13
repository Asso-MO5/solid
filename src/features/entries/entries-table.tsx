import { For, Show } from "solid-js"
import type { EntriesCtrlReturn, SortField, Ticket } from "./entries.types"

// Fonction utilitaire pour calculer le montant total d'un ticket
const getTicketTotalAmount = (ticket: Ticket): number => {
  const basePrice = ticket.ticket_price || 0
  const guidedTourPrice = ticket.notes?.guided_tour ? (ticket.notes.guided_tour_price || 0) : 0
  return basePrice + guidedTourPrice
}

// Fonction pour formater le prix
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

interface EntriesTableProps {
  ctrl: EntriesCtrlReturn
}

export const EntriesTable = (props: EntriesTableProps) => {
  const handleSort = (field: SortField) => {
    const currentFilter = props.ctrl.filter()
    const newDirection =
      currentFilter.sortField === field && currentFilter.sortDirection === 'asc'
        ? 'desc'
        : 'asc'
    props.ctrl.setFilter({ sortField: field, sortDirection: newDirection })
  }

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

  const getStatusClass = (status: Ticket['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const SortIcon = (field: SortField) => {
    const currentFilter = props.ctrl.filter()
    return (
      <Show
        when={currentFilter.sortField === field}
        fallback={<span class="text-gray-400">↕</span>}
      >
        <Show
          when={currentFilter.sortDirection === 'asc'}
          fallback={<span>↓</span>}
        >
          <span>↑</span>
        </Show>
      </Show>
    )
  }

  return (
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-gray-200">
            <th
              class="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('first_name')}
            >
              <div class="flex items-center gap-2">
                Nom
                {SortIcon('first_name')}
              </div>
            </th>
            <th class="px-4 py-3 text-left">Email</th>
            <th class="px-4 py-3 text-left">QR Code</th>
            <th
              class="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('status')}
            >
              <div class="flex items-center gap-2">
                Statut
                {SortIcon('status')}
              </div>
            </th>
            <th class="px-4 py-3 text-left">Visite guidée</th>
            <th
              class="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('slot_start_time')}
            >
              <div class="flex items-center gap-2">
                Horaires
                {SortIcon('slot_start_time')}
              </div>
            </th>
            <th
              class="px-4 py-3 text-left cursor-pointer hover:bg-gray-50"
              onClick={() => handleSort('used_at')}
            >
              <div class="flex items-center gap-2">
                Validé le
                {SortIcon('used_at')}
              </div>
            </th>
            <th class="px-4 py-3 text-left">Montant</th>
            <th class="px-4 py-3 text-left">Paiement</th>
          </tr>
        </thead>
        <tbody>
          <Show
            when={props.ctrl.filteredTickets().length > 0}
            fallback={
              <tr>
                <td colSpan={10} class="px-4 py-8 text-center text-gray-500">
                  Aucun billet trouvé
                </td>
              </tr>
            }
          >
            <For each={props.ctrl.filteredTickets()}>
              {(ticket) => (
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td class="px-4 py-3">
                    {ticket.first_name} {ticket.last_name}
                  </td>
                  <td class="px-4 py-3">
                    {ticket.email || '--'}
                  </td>
                  <td class="px-4 py-3 font-mono text-sm">
                    {ticket.qr_code}
                  </td>
                  <td class="px-4 py-3">
                    <span class={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <Show when={ticket?.notes?.guided_tour}>
                      <div class="text-sm text-blue-600 text-center">
                        {ticket?.notes?.guided_tour ? 'Oui' : 'Non'}
                      </div>
                    </Show>
                  </td>
                  <td class="px-4 py-3">
                    {ticket?.slot_start_time} - {ticket?.slot_end_time}
                  </td>
                  <td class="px-4 py-3">
                    {ticket.used_at
                      ? new Date(ticket.used_at).toLocaleString('fr-FR')
                      : '--'
                    }
                  </td>
                  <td class="px-4 py-3 font-semibold">
                    {formatPrice(getTicketTotalAmount(ticket))}
                  </td>
                  <td class="px-4 py-3">
                    <span class={`px-2 py-1 rounded-full text-xs font-medium ${ticket.transaction_status === 'not_paid' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {ticket.transaction_status === 'not_paid' ? 'Non payé' : 'Payé'}
                    </span>
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

