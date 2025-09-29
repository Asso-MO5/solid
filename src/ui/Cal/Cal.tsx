import { For, type JSX, onMount, createEffect, Show } from "solid-js"
import { CalCtrl } from "./Cal.ctrl"
import { CalDay } from "./CalDay"
import { EventDetailsModal, EventDetailsCtrl, EventCreateModal, EventCreateCtrl, CalList } from "~/features/events"
import type { CalendarEvent } from "./Cal.types"

interface CalProps {
  items?: CalendarEvent[]
  canCreateEvent?: boolean
  renderItem?: (event: CalendarEvent, day: Date) => JSX.Element
  onDayClick?: (day: Date) => void
  onItemClick?: (event: CalendarEvent) => void
  onEventCreated?: (event: CalendarEvent) => void
  highlightedEventId?: string | null
}

export function Cal(props: CalProps) {
  const calendar = CalCtrl()
  const eventDetails = EventDetailsCtrl()

  const eventCreate = EventCreateCtrl(() => {
    props.onEventCreated?.({} as CalendarEvent)
  })

  onMount(() => {
    if (props.items) {
      calendar.setItems(props.items)
    }
  })
  createEffect(() => {
    if (props.items) {
      calendar.setItems(props.items)
    }
  })

  const handleDayClick = (day: Date, hour?: number) => {
    if (!props.canCreateEvent) return

    // Créer une date avec l'heure spécifique si fournie
    let dateWithTime = day
    if (hour !== undefined) {
      dateWithTime = new Date(day)
      dateWithTime.setHours(hour, 0, 0, 0) // Heure exacte, minutes à 0
    }

    eventCreate.openCreateModal(dateWithTime)
    props.onDayClick?.(day)
  }

  const handleEventCreated = (newEvent: CalendarEvent) => {
    props.onEventCreated?.(newEvent)
  }

  const handleItemClick = (event: CalendarEvent) => {
    eventDetails.openEvent(event)
    props.onItemClick?.(event)
  }

  return (
    <div
      class="h-full data-[view=list]:block data-[view=month]:grid data-[view=week]:grid data-[view=day]:grid gap-1 data-[view=month]:grid-cols-7 data-[view=week]:grid-cols-7 data-[view=day]:grid-cols-1"
      data-view={calendar.view()}
    >
      {calendar.view() === 'list' ? (
        <CalList
          events={calendar.listEvents()}
          onItemClick={handleItemClick}
          renderItem={(event) => props.renderItem?.(event, event.startDate)}
          highlightedEventId={props.highlightedEventId}
        />
      ) : (
        <For each={calendar.calendarDays()}>
          {(day) => (
            <CalDay
              day={day}
              view={calendar.view()}
              onDayClick={(date, hour) => {
                calendar.setSelectedDate(date)
                handleDayClick(date, hour)
              }}
              onItemClick={handleItemClick}
              renderItem={props.renderItem}
              formatDate={calendar.formatDate}
              highlightedEventId={props.highlightedEventId}
            />
          )}
        </For>
      )}

      {/* Modal de détails d'événement */}
      <Show when={eventDetails.isOpen() && eventDetails.selectedEvent()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <EventDetailsModal
            event={eventDetails.selectedEvent()!}
            onClose={eventDetails.closeEvent}
            onView={eventDetails.viewEvent}
            onDelete={eventDetails.deleteEvent}
            onDuplicate={eventDetails.duplicateEvent}
            calendar={calendar}
          />
        </div>
      </Show>

      {/* Modal de création d'événement */}
      <EventCreateModal
        isOpen={eventCreate.isCreateModalOpen()}
        onClose={eventCreate.closeCreateModal}
        onEventCreated={handleEventCreated}
        selectedDate={eventCreate.selectedDate()}
        currentView={calendar.view()}
      />
    </div>
  )
}
