import { For, Show } from "solid-js"
import type { CalendarEvent, CalendarCtrlReturn } from "~/ui/Cal/Cal.types"
import { Close } from "~/ui/Close/Close"
import { StatusChip, TypeChip } from "~/ui/Chip"
import { Button } from "~/ui/Button"
import { getRoleLabelSafe } from "./events.const"

interface EventDetailsModalProps {
  event: CalendarEvent
  onClose: () => void
  onEdit?: (event: CalendarEvent) => void
  onView?: (event: CalendarEvent) => void
  onDelete?: (event: CalendarEvent) => void
  onDuplicate?: (event: CalendarEvent) => void
  calendar?: CalendarCtrlReturn
}

export const EventDetailsModal = (props: EventDetailsModalProps) => {
  const formatEventDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatEventTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleView = () => {
    // Ouvrir la page de lecture seule
    props.onView?.(props.event)
  }

  return (
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
      {/* Header */}
      <div class="flex items-start justify-between mb-6">
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {props.event.title}
          </h2>
          <div class="flex items-center gap-2 flex-wrap">
            <StatusChip status={props.event.status} />
            <TypeChip category={props.event.category} />
          </div>
        </div>
        <button
          onClick={() => props.onClose()}
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fermer"
        >
          <Close size={20} />
        </button>
      </div>

      {/* Description */}
      <Show when={props.event.description}>
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Description</h3>
          <p class="text-gray-700 leading-relaxed">
            {props.event.description}
          </p>
        </div>
      </Show>

      {/* Dates et heures */}
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">Horaires</h3>
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-green-500 rounded-full" />
            <div>
              <span class="text-sm font-medium text-gray-600">Début :</span>
              <span class="ml-2 text-gray-900">
                {formatEventDate(props.event.startDate)} à {formatEventTime(props.event.startDate)}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-2 h-2 bg-red-500 rounded-full" />
            <div>
              <span class="text-sm font-medium text-gray-600">Fin :</span>
              <span class="ml-2 text-gray-900">
                {formatEventDate(props.event.endDate)} à {formatEventTime(props.event.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rôles autorisés */}
      <Show when={props.event.allowedRoles && props.event.allowedRoles.length > 0}>
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Accès</h3>
          <div class="flex flex-wrap gap-2">
            <For each={props.event.allowedRoles}>
              {(role) => (
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {getRoleLabelSafe(role)}
                </span>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Confidentiel */}
      <Show when={props.event.isConfidential}>
        <div class="mb-6">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-red-500 rounded-full" />
            <span class="text-sm font-medium text-red-600">Événement confidentiel</span>
          </div>
        </div>
      </Show>

      {/* Actions */}
      <div class="flex items-center justify-end pt-6 border-t border-border">
        <Button variant="secondary" onClick={handleView}>
          Voir
        </Button>
      </div>
    </div>
  )
}
