import { For, Show, createMemo } from "solid-js"
import type { Ticket } from "../entries/entries.types"
import { clientEnv } from "~/env/client"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { TicketEditModal } from "./ticket-edit.modal"
import { TicketResendModal } from "./ticket-resend.modal"
import { useTicketActions } from "./ticket-actions.ctrl"
import type { UpdateTicketData, TicketsCtrlReturn } from "./tickets.types"

interface TicketsTableProps {
  ctrl: TicketsCtrlReturn
}

export const TicketsTable = (props: TicketsTableProps) => {
  const modal = ModalCtrl()
  const ticketActions = useTicketActions()

  // Grouper les tickets par checkout_id pour déterminer quels tickets afficher le bouton de renvoi
  const ticketsByCheckout = createMemo(() => {
    const grouped = new Map<string, Ticket[]>()
    props.ctrl.tickets().forEach(ticket => {
      const checkoutId = ticket?.checkout_id as string | undefined
      if (checkoutId) {
        if (!grouped.has(checkoutId)) {
          grouped.set(checkoutId, [])
        }
        grouped.get(checkoutId)!.push(ticket)
      }
    })
    return grouped
  })



  const handleEditTicket = (ticket: Ticket) => {
    const handleConfirm = async (data: UpdateTicketData) => {
      await ticketActions.updateTicket(ticket.id, data)
      await props.ctrl.getTickets() // Recharger les tickets
    }

    modal.open({
      title: 'Modifier le billet',
      content: (
        <TicketEditModal
          ticket={ticket}
          onConfirm={handleConfirm}
          onCancel={() => modal.close()}
        />
      ),
      size: 'lg',
      closable: true,
    })
  }

  const handleResendTickets = (checkoutId: string) => {
    const ticketsInCheckout = ticketsByCheckout().get(checkoutId) || []
    const handleConfirm = async () => {
      await ticketActions.resendTickets(checkoutId)
      modal.close()
    }

    modal.open({
      title: 'Renvoyer les billets',
      content: (
        <TicketResendModal
          checkoutId={checkoutId}
          ticketCount={ticketsInCheckout.length}
          onConfirm={handleConfirm}
          onCancel={() => modal.close()}
          isResending={ticketActions.isResending()}
        />
      ),
      size: 'md',
      closable: true,
    })
  }

  const getStatusLabel = (status: Ticket['status']) => {
    switch (status) {
      case 'paid':
        return 'Payé'
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

  const downloadTicketPdf = async (ticket: Ticket) => {
    try {
      const response = await fetch(
        `${clientEnv.VITE_OCELOT_URL}/admin/tickets/${ticket.id}/pdf`,
        { credentials: 'include' }
      )

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du billet')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `ticket-${ticket.qr_code || ticket.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
    }
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
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <Show
            when={props.ctrl.tickets().length > 0}
            fallback={
              <tr>
                <td colSpan={12} class="px-4 py-8 text-center text-gray-500">
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
              {(ticket) => {
                const checkoutId = ticket?.checkout_id as string | undefined
                const showResend = checkoutId && ticket.status === 'paid'
                const ticketsInCheckout = checkoutId ? (ticketsByCheckout().get(checkoutId) || []) : []

                console.log(showResend, checkoutId, ticket)
                return (
                  <tr class="border-b border-gray-100 hover:bg-gray-50">
                    <td class="px-4 py-3">
                      {ticket.first_name || '--'} {ticket.last_name || ''}
                    </td>
                    <td class="px-4 py-3 text-sm">
                      {ticket.email || '--'}
                    </td>
                    <td class="px-4 py-3 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => void downloadTicketPdf(ticket)}
                        class="hover:text-primary"
                      >
                        {ticket.qr_code}
                      </button>
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
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTicket(ticket)}
                          disabled={ticketActions.isUpdating()}
                          class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                          title="Modifier"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <Show when={showResend}>
                          <button
                            type="button"
                            onClick={() => handleResendTickets(checkoutId!)}
                            disabled={ticketActions.isResending()}
                            class="px-3 py-1 text-xs bg-green-700 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center border border-green-700"
                            title={`Renvoyer ${ticketsInCheckout.length} billet${ticketsInCheckout.length > 1 ? 's' : ''}`}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </button>
                        </Show>
                      </div>
                    </td>
                  </tr>
                )
              }}
            </For>
          </Show>
        </tbody>
      </table>
    </div>
  )
}

