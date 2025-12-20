import { For, Show } from "solid-js"
import type { StaffPresenceCtrlReturn, StaffPresence } from "./staff-presence.types"
import { useCan } from "../auth/can.ctrl"

interface StaffPresenceTableProps {
  ctrl: StaffPresenceCtrlReturn
  onEdit?: (presence: StaffPresence) => void
}

const PERIOD_LABELS: Record<string, string> = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  both: 'Journée complète',
}

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const StaffPresenceTable = (props: StaffPresenceTableProps) => {
  const canAdmin = useCan({ bureau: true })
  const days = () => props.ctrl.days()

  return (
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead class="sticky top-0 z-10 bg-white">
          <tr class="border-b border-gray-200">
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Membre
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Période
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
              Statut
            </th>
            <Show when={canAdmin()}>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </Show>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <For each={days()}>
            {(day) => (
              <For each={day.presences}>
                {(presence) => (
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {formatDate(presence.date)}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {presence.user_name}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {PERIOD_LABELS[presence.period] || presence.period}
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <span
                        data-status={presence.refused ? 'refused' : 'accepted'}
                        class="px-2 py-1 text-xs font-medium rounded"
                      >
                        {presence.refused ? 'Refusé' : 'Accepté'}
                      </span>
                    </td>
                    <Show when={canAdmin()}>
                      <td class="px-4 py-3 text-sm text-gray-900">
                        <div class="flex items-center gap-2">
                          <button
                            onClick={() => props.ctrl.toggleRefuse(presence.id, !presence.refused)}
                            class="secondary"

                          >
                            {presence.refused ? 'Accepter' : 'Refuser'}
                          </button>
                          <button
                            onClick={() => props.onEdit?.(presence)}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => props.ctrl.deletePresence(presence.id)}
                            class="secondary"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </Show>
                  </tr>
                )}
              </For>
            )}
          </For>
        </tbody>
      </table>
      <Show when={days().length === 0 && !props.ctrl.isFetching()}>
        <div class="text-center py-8 text-gray-500">
          Aucune présence enregistrée
        </div>
      </Show>
    </div>
  )
}

