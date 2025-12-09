import { Show } from "solid-js"
import { useEntries } from "./entries.ctrl"
import { EntriesTable } from "./entries-table"
import { EntriesScanQr } from "./entries-scan.qr"
import type { Ticket } from "./entries.types"

export const EntriesView = () => {
  const ctrl = useEntries()

  return (
    <div class="space-y-4">

      {/* En-tête avec filtres et bouton scan */}
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 flex-1">
          <div class="flex items-center w-full gap-4">
            <div class="w-full grow">
              <input
                type="text"
                placeholder="Rechercher (nom, email, QR code)..."
                value={ctrl.filter().search}
                class="w-full p-2"
                onInput={(e) => ctrl.setFilter({ search: e.currentTarget.value })}
              />
            </div>

            <select
              value={ctrl.filter().status || ''}
              onChange={(e) => ctrl.setFilter({ status: e.currentTarget.value as Ticket['status'] || undefined })}
              class="p-2"
            >
              <option value="">Tous les statuts</option>
              <option value="paid">Payé</option>
              <option value="used">Utilisé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

      </div>

      {/* Tableau */}
      <Show when={ctrl.isLoading()}>
        <div class="flex items-center justify-center p-8">
          <div class="text-gray-500">Chargement des billets...</div>
        </div>
      </Show>


      <Show when={!ctrl.isFetching()}>
        <div class="grid md:grid-cols-[1fr_2fr] gap-4">
          <EntriesScanQr
            scanResults={ctrl.tickets().filter(ticket => ticket.status === 'used').sort((a, b) => new Date(b.used_at || '').getTime() - new Date(a.used_at || '').getTime())}
            onTicketScanned={(ticket) => {
              if (ticket) {
                ctrl.getTickets()
              }
            }}
          />
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <EntriesTable ctrl={ctrl} />
          </div>

        </div>

      </Show>
    </div>
  )
}

