import { createEffect, Show, For } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { getCategoryLabelSafe, getStatusLabelSafe } from "../events/events.const"
import type { EventDetailsData } from "./event-details.types"

/**
 * Modal de détails d'événement
 * Affichage en lecture seule des détails
 */

interface EventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: EventDetailsData | null
  loading: boolean
  error: string | null
  onView: (event: EventDetailsData) => void
  onDelete: (event: EventDetailsData) => void
  onDuplicate: (event: EventDetailsData) => void
}

export const EventDetailsModal = (props: EventDetailsModalProps) => {
  const modal = ModalCtrl()

  createEffect(() => {
    if (props.isOpen && props.event) {
      modal.open({
        title: props.event.title,
        content: (
          <div class="space-y-6">
            <Show when={props.loading}>
              <div class="flex items-center justify-center p-8">
                <div class="text-muted">Chargement...</div>
              </div>
            </Show>

            <Show when={props.error}>
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="text-red-800">Erreur: {props.error}</div>
              </div>
            </Show>

            <Show when={!props.loading && !props.error && props.event}>
              {(event) => (
                <div class="space-y-4">
                  <div class="flex items-center gap-4">
                    <span
                      class="px-3 py-1 rounded-full text-sm font-medium"
                      data-type="category"
                      data-variant={event().category}
                    >
                      {getCategoryLabelSafe(event().category)}
                    </span>
                    <span
                      class="px-3 py-1 rounded-full text-sm font-medium"
                      data-type="status"
                      data-variant={event().status}
                    >
                      {getStatusLabelSafe(event().status)}
                    </span>
                    <Show when={event().isConfidential}>
                      <span class="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                        Confidentiel
                      </span>
                    </Show>
                  </div>

                  <Show when={event().description}>
                    <div>
                      <h3 class="font-semibold mb-2">Description</h3>
                      <p class="text-muted">{event().description}</p>
                    </div>
                  </Show>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 class="font-semibold mb-2">Date de début</h3>
                      <p class="text-muted">
                        {event().startDate.toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <h3 class="font-semibold mb-2">Date de fin</h3>
                      <p class="text-muted">
                        {event().endDate.toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <Show when={event().allowedRoles.length > 0}>
                    <div>
                      <h3 class="font-semibold mb-2">Rôles autorisés</h3>
                      <div class="flex flex-wrap gap-2">
                        <For each={event().allowedRoles}>
                          {(role) => (
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {role}
                            </span>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>

                  <div class="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => props.onView(event())}
                      class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Voir
                    </button>
                    <button
                      onClick={() => props.onDelete(event())}
                      class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      onClick={() => props.onDuplicate(event())}
                      class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Dupliquer
                    </button>
                  </div>
                </div>
              )}
            </Show>
          </div>
        ),
        size: 'lg',
        closable: true,
        onClose: props.onClose
      })
    } else if (!props.isOpen) {
      modal.close()
    }
  })

  return null
}
