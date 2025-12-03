import type { TicketsCtrlReturn } from "./tickets.types"
import type { Ticket } from "../entries/entries.types"

interface TicketsFiltersProps {
  ctrl: TicketsCtrlReturn
}

export const TicketsFilters = (props: TicketsFiltersProps) => {
  const filter = () => props.ctrl.filter()

  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex gap-4">
          {/* Recherche unifiée */}
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-600">Recherche</label>
            <input
              type="text"
              value={filter().search || ''}
              onInput={(e) => props.ctrl.setFilter({ search: e.currentTarget.value || undefined })}
              placeholder="Email, QR code, Checkout ID..."
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Date de réservation */}
          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-600">Date de réservation</label>
            <input
              type="date"
              value={filter().reservation_date || ''}
              onInput={(e) => props.ctrl.setFilter({ reservation_date: e.currentTarget.value || undefined }, true)}
              placeholder="YYYY-MM-DD"
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm text-gray-600">Statut</label>
            <select
              value={filter().status || ''}
              onChange={(e) => props.ctrl.setFilter({ status: e.currentTarget.value as Ticket['status'] || undefined }, true)}
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="used">Utilisé</option>
              <option value="cancelled">Annulé</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
        <button onClick={() => props.ctrl.resetFilters()}>
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

