import { For, type JSX } from "solid-js"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"
import { getCategoryLabelSafe, getStatusLabelSafe } from "./events.const"

interface CalListProps {
  events: CalendarEvent[]
  onItemClick?: (event: CalendarEvent) => void
  renderItem?: (event: CalendarEvent) => JSX.Element
  highlightedEventId?: string | null
}

export const CalList = (props: CalListProps) => {
  const formatEventDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatEventTime = (date: Date): string => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div class="space-y-2">
      <For each={props.events}>
        {(event) => (
          <div
            class={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${props.highlightedEventId === event.id ? 'ring-2 ring-yellow-400 bg-yellow-50 animate-pulse' : ''
              }`}
            style={{
              'border-left': `4px solid ${event.color || '#3b82f6'}`
            }}
            onClick={() => props.onItemClick?.(event)}
          >
            {props.renderItem && props.renderItem(event) ? (
              props.renderItem(event)
            ) : (
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h3>
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium
                        data-[type=status]:data-[variant=draft]:bg-gray-100 data-[type=status]:data-[variant=draft]:text-gray-800
                        data-[type=status]:data-[variant=published]:bg-green-100 data-[type=status]:data-[variant=published]:text-green-800
                        data-[type=status]:data-[variant=cancelled]:bg-red-100 data-[type=status]:data-[variant=cancelled]:text-red-800
                        data-[type=status]:data-[variant=completed]:bg-blue-100 data-[type=status]:data-[variant=completed]:text-blue-800"
                      data-type="status"
                      data-variant={event.status}
                    >
                      {getStatusLabelSafe(event.status || '')}
                    </span>
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium
                        data-[type=category]:data-[variant=video]:bg-blue-100 data-[type=category]:data-[variant=video]:text-blue-800
                        data-[type=category]:data-[variant=expo]:bg-purple-100 data-[type=category]:data-[variant=expo]:text-purple-800
                        data-[type=category]:data-[variant=ag]:bg-green-100 data-[type=category]:data-[variant=ag]:text-green-800
                        data-[type=category]:data-[variant=live]:bg-red-100 data-[type=category]:data-[variant=live]:text-red-800
                        data-[type=category]:data-[variant=meeting]:bg-yellow-100 data-[type=category]:data-[variant=meeting]:text-yellow-800
                        data-[type=category]:data-[variant=training]:bg-indigo-100 data-[type=category]:data-[variant=training]:text-indigo-800
                        data-[type=category]:data-[variant=conference]:bg-pink-100 data-[type=category]:data-[variant=conference]:text-pink-800
                        data-[type=category]:data-[variant=other]:bg-gray-100 data-[type=category]:data-[variant=other]:text-gray-800"
                      data-type="category"
                      data-variant={event.category}
                    >
                      {getCategoryLabelSafe(event.category)}
                    </span>
                  </div>

                  {event.description && (
                    <p class="text-gray-600 text-sm mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <span class="font-medium">Début:</span>
                      <span>{formatEventDate(event.startDate)}</span>
                      <span>{formatEventTime(event.startDate)}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="font-medium">Fin:</span>
                      <span>{formatEventDate(event.endDate)}</span>
                      <span>{formatEventTime(event.endDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </For>

      {props.events.length === 0 && (
        <div class="text-center py-8 text-gray-500">
          <p>Aucun événement trouvé</p>
        </div>
      )}
    </div>
  )
}
