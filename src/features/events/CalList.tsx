import { For, type JSX, createMemo, Show } from "solid-js"
import type { CalendarEvent, CalendarDay } from "~/ui/Cal/Cal.types"
import { getCategoryLabelSafe, getStatusLabelSafe } from "./events.const"

interface CalListProps {
  events: CalendarEvent[]
  calendarDays?: CalendarDay[]
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

  const formatTime = (time: string): string => {
    return time.substring(0, 5) // Format HH:MM
  }

  // Grouper les événements et les jours d'ouverture par date
  const groupedItems = createMemo(() => {
    const items: Array<{ type: 'event' | 'opening'; date: Date; data: CalendarEvent | CalendarDay }> = []

    // Déterminer la plage du mois actuel (basé sur le premier événement ou utiliser la date actuelle)
    let startOfMonth: Date
    let endOfMonth: Date

    if (props.events.length > 0) {
      const firstEventDate = new Date(props.events[0].startDate)
      startOfMonth = new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1)
      endOfMonth = new Date(firstEventDate.getFullYear(), firstEventDate.getMonth() + 1, 0)
    } else if (props.calendarDays && props.calendarDays.length > 0) {
      const firstDayDate = props.calendarDays[0].date
      startOfMonth = new Date(firstDayDate.getFullYear(), firstDayDate.getMonth(), 1)
      endOfMonth = new Date(firstDayDate.getFullYear(), firstDayDate.getMonth() + 1, 0)
    } else {
      // Fallback: utiliser la date actuelle
      const now = new Date()
      startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    // Ajouter les événements
    props.events.forEach(event => {
      items.push({
        type: 'event',
        date: event.startDate,
        data: event
      })
    })

    // Ajouter les jours d'ouverture qui ont des horaires et qui sont dans le mois
    if (props.calendarDays) {
      props.calendarDays.forEach(day => {
        const dayDate = new Date(day.date)
        // Filtrer pour le mois actuel
        if (dayDate >= startOfMonth && dayDate <= endOfMonth) {
          if (day.openingHours && day.openingHours.length > 0) {
            items.push({
              type: 'opening',
              date: day.date,
              data: day
            })
          }
        }
      })
    }

    // Trier par date
    return items.sort((a, b) => a.date.getTime() - b.date.getTime())
  })

  return (
    <div class="space-y-2">
      <For each={groupedItems()}>
        {(item) => {
          if (item.type === 'opening') {
            const day = item.data as CalendarDay
            return (
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">
                        {day.date.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      <span
                        class={`px-2 py-1 rounded-full text-xs font-medium ${day.isOpen
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {day.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>

                    <Show when={day.openingHours && day.openingHours.length > 0}>
                      <div class="space-y-1">
                        <h4 class="text-sm font-medium text-gray-700 mb-1">Horaires d'ouverture:</h4>
                        <For each={day.openingHours}>
                          {(hours) => (
                            <div class="text-sm text-gray-600">
                              <span class="font-medium">{hours.audience_type === 'public' ? 'Public' : 'Membres'}:</span>
                              {' '}
                              <span>{formatTime(hours.start_time)} - {formatTime(hours.end_time)}</span>
                              {hours.description && (
                                <span class="text-gray-500 ml-2">({hours.description})</span>
                              )}
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>
            )
          }

          const event = item.data as CalendarEvent
          return (
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
          )
        }}
      </For>

      {groupedItems().length === 0 && (
        <div class="text-center py-8 text-gray-500">
          <p>Aucun événement ou jour d'ouverture trouvé</p>
        </div>
      )}
    </div>
  )
}
