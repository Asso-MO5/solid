import { For, Show } from "solid-js"
import type { MuseumPresenceDay } from "./museum-presence.types"
import { useCan } from "../auth/can.ctrl"

interface MuseumPresenceDayModalProps {
  day: MuseumPresenceDay
  onToggleRefuse: (presenceId: string, refused: boolean) => Promise<void>
  isLoading: boolean
}

export const MuseumPresenceDayModal = (props: MuseumPresenceDayModalProps) => {

  const acceptedPresences = () => props.day.all_presences?.filter(p => !p.refused) || []
  const refusedPresences = () => props.day.all_presences?.filter(p => p.refused) || []
  const canAdmin = useCan({ bureau: true })

  return (
    <div class="flex flex-col gap-4">
      <div>
        <Show when={!props.day.is_open}>
          <span class="text-sm text-red-600 font-medium">Musée fermé</span>
        </Show>
      </div>

      <Show when={props.day.all_presences && props.day.all_presences.length === 0}>
        <div class="text-center py-8 text-gray-500">
          Aucune présence enregistrée pour ce jour.
        </div>
      </Show>

      <Show when={props.day.all_presences && props.day.all_presences.length > 0}>
        <div class="space-y-4">
          <Show when={acceptedPresences().length > 0}>
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2">
                Présences acceptées ({acceptedPresences().length})
              </h4>
              <div class="space-y-2">
                <For each={acceptedPresences()}>
                  {(presence) => (
                    <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span class="text-sm font-medium text-gray-900">
                        {presence.user_name}
                      </span>
                      <Show when={canAdmin()}>
                        <button
                          type="button"
                          onClick={() => props.onToggleRefuse(presence.id, true)}
                          disabled={props.isLoading}
                          class="secondary text-xs"
                        >
                          Refuser
                        </button>
                      </Show>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          <Show when={refusedPresences().length > 0 && canAdmin()}>
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2">
                Présences refusées ({refusedPresences().length})
              </h4>
              <div class="space-y-2">
                <For each={refusedPresences()}>
                  {(presence) => (
                    <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span class="text-sm font-medium text-gray-500 line-through">
                        {presence.user_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => props.onToggleRefuse(presence.id, false)}
                        disabled={props.isLoading}
                        class="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Accepter
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  )
}

