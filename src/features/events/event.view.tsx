import { Show } from "solid-js"
import { getCategoryLabelSafe, getStatusLabelSafe } from "./events.const"

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  category: string
  status: string
  allowedRoles: string[]
  isConfidential: boolean
  color: string
  [key: string]: unknown
}

interface EventViewProps {
  event: Event | null
  loading: boolean
  error: string | null
}

export function EventView(props: EventViewProps) {
  return (
    <div class="max-w-4xl mx-auto p-6">
      <Show when={props.loading}>
        <div class="flex items-center justify-center py-12">
          <div class="text-lg">Chargement de l'événement...</div>
        </div>
      </Show>

      <Show when={props.error}>
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 class="text-xl font-semibold text-red-800 mb-2">Erreur</h2>
          <p class="text-red-600">{props.error}</p>
        </div>
      </Show>

      <Show when={!props.loading && !props.error && props.event}>
        {(event) => (
          <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header avec couleur de catégorie */}
            <div
              class="h-2 w-full"
              style={{ 'background-color': event().color || '#3b82f6' }}
            />

            <div class="p-6">
              {/* Titre et statut */}
              <div class="flex justify-between items-start mb-4">
                <h1 class="text-3xl font-bold text-gray-900">{event().title}</h1>
                <div class="flex gap-2">
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    data-type="status"
                    data-variant={event().status}
                  >
                    {getStatusLabelSafe(event().status)}
                  </span>
                  <span
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    data-type="category"
                    data-variant={event().category}
                  >
                    {getCategoryLabelSafe(event().category)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <Show when={event().description}>
                <div class="mb-6">
                  <h2 class="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p class="text-gray-700 whitespace-pre-wrap">{event().description}</p>
                </div>
              </Show>

              {/* Informations principales */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Dates */}
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Horaires</h3>
                  <div class="space-y-2">
                    <div>
                      <span class="font-medium text-gray-700">Début :</span>
                      <span class="ml-2 text-gray-600">
                        {new Date(event().startDate).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Fin :</span>
                      <span class="ml-2 text-gray-600">
                        {new Date(event().endDate).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Accès */}
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Accès</h3>
                  <div class="space-y-2">
                    <div>
                      <span class="font-medium text-gray-700">Rôles autorisés :</span>
                      <span class="ml-2 text-gray-600">
                        {event().allowedRoles?.length > 0
                          ? event().allowedRoles.join(', ')
                          : 'Public'
                        }
                      </span>
                    </div>
                    <Show when={event().isConfidential}>
                      <div class="text-amber-600 font-medium">
                        ⚠️ Événement confidentiel
                      </div>
                    </Show>
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <Show when={event().externalUrl || event().plan || event().internalNotes}>
                <div class="border-t pt-6">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Informations supplémentaires</h3>
                  <div class="space-y-3">
                    <Show when={event().externalUrl}>
                      <div>
                        <span class="font-medium text-gray-700">Lien externe :</span>
                        <a
                          href={event().externalUrl as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="ml-2 text-blue-600 hover:text-blue-800 underline"
                        >
                          {(event().externalName as string) || (event().externalUrl as string)}
                        </a>
                      </div>
                    </Show>

                    <Show when={event().plan}>
                      <div>
                        <span class="font-medium text-gray-700">Plan :</span>
                        <div class="mt-2 p-3 bg-gray-50 rounded-lg">
                          <pre class="whitespace-pre-wrap text-sm text-gray-700">{event().plan as string}</pre>
                        </div>
                      </div>
                    </Show>

                    <Show when={event().internalNotes}>
                      <div>
                        <span class="font-medium text-gray-700">Notes internes :</span>
                        <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p class="text-sm text-amber-800">{event().internalNotes as string}</p>
                        </div>
                      </div>
                    </Show>
                  </div>
                </div>
              </Show>
            </div>
          </div>
        )}
      </Show>
    </div>
  )
}