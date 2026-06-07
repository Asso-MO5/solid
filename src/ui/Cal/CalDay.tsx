import { For, Show, createSignal, onMount } from "solid-js"
import type { CalDayProps } from "./CalDay.types"

export const CalDay = (props: CalDayProps) => {
  const [isMobile, setIsMobile] = createSignal(false)
  const [hoveredItemId, setHoveredItemId] = createSignal<string | null>(null)

  onMount(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  })

  const handleDayClick = () => {
    props.onDayClick(props.day.date)
  }

  const handleHourClick = (hour: number) => {
    props.onDayClick(props.day.date, hour)
  }

  return (
    <Show
      when={props.view === 'month'}
      fallback={
        // Vue semaine/jour : affichage avec heures
        <div class="border border-gray-200 rounded-sm bg-white">
          {/* Header du jour */}
          <div
            class="p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50
                   data-[current-month=false]:text-gray-400 data-[current-month=false]:bg-bg 
                   data-[today=true]:bg-blue-50 data-[today=true]:border-primary 
                   data-[selected=true]:bg-blue-100 data-[selected=true]:border-primary"
            data-current-month={props.day.isCurrentMonth}
            data-today={props.day.isToday}
            data-selected={props.day.isSelected}
            onClick={handleDayClick}
          >
            <div class="text-sm font-medium">
              {props.formatDate(props.day.date)}
            </div>
          </div>

          {/* Grille des heures */}
          <div class="grid grid-rows-24 gap-px">
            <For each={Array.from({ length: 24 }, (_, i) => i)}>
              {(hour) => (
                <div
                  class="h-12 p-1 border-b border-gray-100 cursor-pointer hover:bg-gray-50 relative overflow-hidden"
                  onClick={() => handleHourClick(hour)}
                >
                  {/* Label de l'heure */}
                  <div class="text-xs text-gray-500 absolute left-1 top-1">
                    {hour.toString().padStart(2, '0')}:00
                  </div>

                  {/* Événements pour cette heure */}
                  <div class="ml-12 h-full overflow-y-auto">
                    <For each={props.day.items.filter(event => {
                      const eventStart = event.startDate.getHours()
                      const eventEnd = event.endDate.getHours()
                      return hour >= eventStart && hour < eventEnd
                    })}>
                      {(event) => (
                        <div
                          class="text-xs p-1 rounded cursor-pointer mb-1"
                          data-highlighted={props.highlightedEventId === event.id ? 'true' : 'false'}
                          style={{
                            'background-color': hoveredItemId() === event.id
                              ? (event.color ? `${event.color}40` : '#bfdbfe')
                              : (event.color ? `${event.color}20` : '#dbeafe'),
                            'color': event.color || '#1e40af',
                            'border-left': `3px solid ${event.color || '#3b82f6'}`,
                            'transition': 'background-color 150ms ease',
                          }}
                          onMouseEnter={() => setHoveredItemId(event.id)}
                          onMouseLeave={() => setHoveredItemId(null)}
                          onClick={(e) => {
                            e.stopPropagation()
                            props.onItemClick?.(event)
                          }}
                        >
                          <Show when={props.renderItem}>
                            {props.renderItem!(event, props.day.date)}
                          </Show>
                          <Show when={!props.renderItem}>
                            <div class="font-medium">{event.title}</div>
                            <Show when={event.description}>
                              <div class="text-xs opacity-75">{event.description}</div>
                            </Show>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      }
    >
      {/* Vue mois */}
      <Show
        when={isMobile()}
        fallback={
          /* Vue desktop */
          <div
            class="min-h-24 p-2 border rounded-sm cursor-pointer hover:bg-gray-50 bg-white
                   data-[current-month=false]:text-gray-400 data-[current-month=false]:bg-bg 
                   data-[today=true]:bg-blue-50 data-[today=true]:border-primary 
                   data-[selected=true]:bg-blue-100 data-[selected=true]:border-primary
                   data-[open=true]:border-green-300 data-[open=true]:bg-green-50/30
                   data-[open=false]:border-red-300 data-[open=false]:bg-red-50/30"
            data-current-month={props.day.isCurrentMonth}
            data-today={props.day.isToday}
            data-selected={props.day.isSelected}
            data-open={props.day.isOpen}
            onClick={handleDayClick}
          >

            <div class="flex items-center justify-between mb-1">
              <div class="text-sm font-medium">
                {props.formatDate(props.day.date)}
              </div>
              <div class="flex items-center gap-2">
                <Show when={props.canCreateEvent}>
                  <button
                    class="text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white rounded px-2 py-0.5 leading-none"
                    onClick={(e) => { e.stopPropagation(); props.onCreateEvent?.(props.day.date) }}
                    title="Créer un événement"
                  >+ Événement</button>
                </Show>
                <Show when={props.day.paid_tickets_count !== undefined}>
                  <div class="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5">
                    {props.day.paid_tickets_count}
                  </div>
                </Show>
                <Show when={props.showMembersCount && props.day.members_presence_count !== undefined && props.day.members_presence_count > 0}>
                  <div class="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded px-2 py-0.5">
                    👥 {props.day.members_presence_count}
                  </div>
                </Show>
                <Show when={props.day.isOpen !== undefined}>
                  <div
                    class="w-2 h-2 rounded-full"
                    data-open={props.day.isOpen ? 'true' : 'false'}
                    title={props.day.isOpen ? 'Ouvert' : 'Fermé'}
                  />
                </Show>
              </div>
            </div>

            <div class="space-y-1">
              <For each={props.day.items}>
                {(item) => (
                  <div
                    class="text-xs p-1 rounded cursor-pointer"
                    data-highlighted={props.highlightedEventId === item.id ? 'true' : 'false'}
                    style={{
                      'background-color': hoveredItemId() === item.id
                        ? (item.color ? `${item.color}40` : '#bfdbfe')
                        : (item.color ? `${item.color}20` : '#dbeafe'),
                      'color': item.color || '#1e40af',
                      'border-left': `3px solid ${item.color || '#3b82f6'}`,
                      'transition': 'background-color 150ms ease',
                    }}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      props.onItemClick?.(item)
                    }}
                  >
                    <Show when={props.renderItem}>
                      {props.renderItem!(item, props.day.date)}
                    </Show>
                    <Show when={!props.renderItem}>
                      <div class="font-medium">{item.title}</div>
                      <Show when={item.description}>
                        <div class="text-xs opacity-75">{item.description}</div>
                      </Show>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>
        }
      >
        {/* Vue mobile avec ronds */}
        <div
          class="aspect-square rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 
                 data-[current-month=false]:text-gray-400 data-[current-month=false]:bg-bg 
                 data-[today=true]:bg-blue-50 data-[today=true]:border-primary 
                 data-[selected=true]:bg-blue-100 data-[selected=true]:border-primary
                 data-[open=true]:border-green-300 data-[open=true]:bg-green-50/30
                 data-[open=false]:border-red-300 data-[open=false]:bg-red-50/30"
          data-current-month={props.day.isCurrentMonth}
          data-today={props.day.isToday}
          data-selected={props.day.isSelected}
          data-open={props.day.isOpen}
          onClick={handleDayClick}
        >
          {/* Numéro du jour */}
          <div class="text-sm font-medium mb-1">
            {props.formatDate(props.day.date)}
          </div>
          {/* Indicateur ouvert/fermé */}
          <Show when={props.day.isOpen !== undefined}>
            <div
              class="w-2 h-2 rounded-full mb-1"
              data-open={props.day.isOpen ? 'true' : 'false'}
              title={props.day.isOpen ? 'Ouvert' : 'Fermé'}
            />
          </Show>
          {/* Billets payés */}
          <Show when={props.day.paid_tickets_count !== undefined}>
            <div class="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 mb-1">
              {props.day.paid_tickets_count}
            </div>
          </Show>
          {/* Membres présents */}
          <Show when={props.showMembersCount && props.day.members_presence_count !== undefined && props.day.members_presence_count > 0}>
            <div class="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 mb-1">
              👥 {props.day.members_presence_count}
            </div>
          </Show>

          {/* Ronds pour les événements */}
          <div class="flex flex-wrap justify-center gap-1">
            <For each={props.day.items.slice(0, 3)}>
              {(item) => (
                <div
                  class="w-2 h-2 rounded-full cursor-pointer hover:opacity-80"
                  style={{
                    'background-color': item.color || '#3b82f6'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    props.onItemClick?.(item)
                  }}
                  title={item.title}
                />
              )}
            </For>
            <Show when={props.day.items.length > 3}>
              <div class="w-2 h-2 rounded-full bg-gray-400" title={`+${props.day.items.length - 3} autres`} />
            </Show>
          </div>
        </div>
      </Show>
    </Show>
  )
}