import { Cal } from "~/ui/Cal/Cal"
import { CalDateDisplay } from "~/ui/Cal/CalDate.display"
import { CalTodayBtn } from "~/ui/Cal/CalToday.btn"
import { CalViewSelector } from "~/ui/Cal/CalView.selector"
import { CalControls } from "~/ui/Cal/CalControls"
import { CalCtrl } from "~/ui/Cal/Cal.ctrl"
import { useAuth } from "@solid-mediakit/auth/client"
import { EventsCtrl } from "~/features/events/events.ctrl"
import { Show, createEffect, createSignal, onMount } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"

const AdminEventsList = () => {
  const { session } = useAuth()
  const eventsCtrl = EventsCtrl()
  const { events, loading, getEvents } = eventsCtrl
  const calendar = CalCtrl()
  const [previousDate, setPreviousDate] = createSignal<Date | null>(null)
  const [searchParams] = useSearchParams()
  const [highlightedEventId, setHighlightedEventId] = createSignal<string | null>(null)

  // Gérer le paramètre event dans l'URL pour mettre en évidence un événement
  onMount(() => {
    const eventId = searchParams.event
    if (eventId && typeof eventId === 'string') {
      setHighlightedEventId(eventId)
      // Nettoyer l'URL après un délai pour enlever le paramètre event
      setTimeout(() => {
        const url = new URL(window.location.href)
        url.searchParams.delete('event')
        window.history.replaceState({}, '', url.toString())
        setHighlightedEventId(null)
      }, 3000) // 3 secondes de surbrillance
    }
  })

  // Recharger les événements quand la vue ou la date change
  createEffect(() => {
    const currentView = calendar.view()
    const currentDate = calendar.selectedDate()
    const prevDate = previousDate()

    // Comparer selon la vue
    let shouldRefresh = false

    if (currentView === 'month') {
      // En vue mois, on ne refresh que si le mois/année change
      shouldRefresh = !prevDate ||
        prevDate.getMonth() !== currentDate.getMonth() ||
        prevDate.getFullYear() !== currentDate.getFullYear()
    } else if (currentView === 'week') {
      // En vue semaine, on ne refresh que si la semaine change
      shouldRefresh = !prevDate ||
        Math.floor(prevDate.getTime() / (7 * 24 * 60 * 60 * 1000)) !==
        Math.floor(currentDate.getTime() / (7 * 24 * 60 * 60 * 1000))
    } else {
      // En vue jour/liste, on refresh si le jour change
      shouldRefresh = !prevDate ||
        prevDate.getDate() !== currentDate.getDate() ||
        prevDate.getMonth() !== currentDate.getMonth() ||
        prevDate.getFullYear() !== currentDate.getFullYear()
    }

    if (shouldRefresh) {
      setPreviousDate(currentDate)
      getEvents(currentView, currentDate)
    }
  })


  return (
    <div class="h-full w-full grid grid-rows-[auto_1fr] gap-4 relative">
      <header class="flex justify-between items-center gap2">
        <div class="flex items-center gap-2 flex-col md:flex-row">
          <div class="flex items-center gap-2">
            <h1 class="m-0">Événements</h1>
          </div>
          <div class="flex items-center gap-2">
            <CalControls />
            <CalDateDisplay />
          </div>
        </div>
        <div class="flex items-center md:gap-4 gap-2 flex-col md:flex-row">
          <CalTodayBtn />
          <CalViewSelector />
        </div>
      </header>
      <div class="relative h-full">
        <div class="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent scrollbar-track-rounded-full overflow-x-hidden flex flex-col gap-4">
          <Show when={loading()} ><div class="absolute inset-0 flex items-center justify-center">
            Chargement...
          </div>
          </Show>
          <Show when={!loading()}>
            <Cal
              canCreateEvent={session()?.user?.roles?.admin}
              items={events() as unknown as CalendarEvent[]}
              highlightedEventId={highlightedEventId()}
              onEventCreated={() => {
                getEvents(calendar.view(), calendar.selectedDate())
              }}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}

export default AdminEventsList