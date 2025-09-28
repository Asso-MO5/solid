import { For, Show } from "solid-js"
import type { CalendarEvent } from "./events.types"

/**
 * Vue pour la feature events (collection)
 * Composant CalList refactorisé
 */

interface EventsViewProps {
  events: CalendarEvent[]
  loading: boolean
  error: string | null
  highlightedEventId?: string | null
}

export const EventsView = (props: EventsViewProps) => {
  return (
    <div class="space-y-4">
      <Show when={props.loading}>
        <div class="flex items-center justify-center p-8">
          <div class="text-muted">Chargement des événements...</div>
        </div>
      </Show>

      <Show when={props.error}>
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="text-red-800">Erreur: {props.error}</div>
        </div>
      </Show>

      <Show when={!props.loading && !props.error && props.events.length === 0}>
        <div class="flex items-center justify-center p-8">
          <div class="text-muted">Aucun événement trouvé</div>
        </div>
      </Show>

      <Show when={!props.loading && !props.error && props.events.length > 0}>
        <div class="space-y-3">
          <For each={props.events}>
            {(event) => (
              <div
                class={`p-4 rounded-lg border-l-4 transition-all duration-200 ${props.highlightedEventId === event.id
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : ''
                  }`}
                style={{ 'border-left-color': event.color }}
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg mb-1">{event.title}</h3>
                    <Show when={event.description}>
                      <p class="text-muted text-sm mb-2">{event.description}</p>
                    </Show>
                    <div class="flex items-center gap-4 text-sm text-muted">
                      <span>
                        {event.startDate.toLocaleDateString('fr-FR')}
                        {event.startDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>→</span>
                      <span>
                        {event.endDate.toLocaleDateString('fr-FR')}
                        {event.endDate.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      data-type="category"
                      data-variant={event.category}
                    >
                      {event.category}
                    </span>
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      data-type="status"
                      data-variant={event.status}
                    >
                      {event.status}
                    </span>
                    <Show when={event.isConfidential}>
                      <span class="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Confidentiel
                      </span>
                    </Show>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
