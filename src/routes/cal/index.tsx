import { Cal } from "~/ui/Cal/Cal"
import { CalDateDisplay } from "~/ui/Cal/CalDate.display"
import { CalTodayBtn } from "~/ui/Cal/CalToday.btn"
import { CalViewSelector } from "~/ui/Cal/CalView.selector"
import { CalControls } from "~/ui/Cal/CalControls"
import { CalCtrl } from "~/ui/Cal/Cal.ctrl"
import { EventsCtrl } from "~/features/events/events.ctrl"
import { useStaffPresence } from "~/features/staff-presence/staff-presence.ctrl"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { DayDetailsModal } from "./day-details.modal"
import type { CreatePresenceData, UpdatePresenceData } from "~/features/staff-presence/staff-presence.types"
import { Show, createEffect, createMemo, createSignal, onMount } from "solid-js"
import { useSearchParams } from "@solidjs/router"
import { useCan } from "~/features/auth/can.ctrl"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"
import { deleteEventById } from "~/features/events/EventDetails.ctrl"

const AdminEventsList = () => {

  const { events, calendarDays: daysInfo, loading, getEvents } = EventsCtrl()
  const presenceCtrl = useStaffPresence()
  const calendar = CalCtrl()
  const modal = ModalCtrl()
  const canMember = useCan({ member: true })
  const [previousDate, setPreviousDate] = createSignal<Date | null>(null)
  const [previousView, setPreviousView] = createSignal<string | null>(null)
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

  const canAdmin = useCan({ bureau: true })

  // Charger les événements et présences au montage initial
  onMount(() => {
    getEvents(calendar.view(), calendar.selectedDate(), canAdmin())
    // Les membres voient leurs présences, les admins voient toutes les présences
    if (canMember() || canAdmin()) {
      presenceCtrl.getPresences(calendar.view(), calendar.selectedDate())
    }
  })

  // Synchroniser les informations des jours avec le calendrier
  createEffect(() => {
    const info = daysInfo()
    if (info.size > 0) {
      calendar.setDaysInfo(info)
    }
  })

  // Recharger les événements quand la vue ou la date change
  createEffect(() => {
    const currentView = calendar.view()
    const currentDate = calendar.selectedDate()
    const prevDate = previousDate()
    const prevView = previousView()

    // Vérifier si la vue a changé
    const viewChanged = prevView !== null && prevView !== currentView

    // Comparer selon la vue
    let shouldRefresh = false

    if (viewChanged) {
      // Si la vue change, toujours refresh
      shouldRefresh = true
    } else if (currentView === 'month') {
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
      setPreviousView(currentView)
      getEvents(currentView, currentDate, canAdmin())
      // Les membres voient leurs présences, les admins voient toutes les présences
      if (canMember() || canAdmin()) {
        presenceCtrl.getPresences(currentView, currentDate)
      }
    }
  })

  // Combiner les événements et les présences
  const allItems = createMemo((): CalendarEvent[] => {
    const eventsList = events() || []
    const presencesList = (canMember() || canAdmin()) ? presenceCtrl.presencesAsEvents() : []
    const combined = [...eventsList, ...presencesList]
    return combined
  })

  // Handlers pour les actions de présence
  const handlePresenceCreate = async (data: CreatePresenceData) => {
    await presenceCtrl.createPresence(data)
    await presenceCtrl.getPresences(calendar.view(), calendar.selectedDate())
    // Ne pas fermer la modale, juste recharger les données
  }

  const handlePresenceUpdate = async (id: string, data: UpdatePresenceData) => {
    await presenceCtrl.updatePresence(id, data)
    await presenceCtrl.getPresences(calendar.view(), calendar.selectedDate())
    // Ne pas fermer la modale, juste recharger les données
  }

  const handlePresenceDelete = async (id: string) => {
    await presenceCtrl.deletePresence(id)
    await presenceCtrl.getPresences(calendar.view(), calendar.selectedDate())
    // Ne pas fermer la modale, juste recharger les données
  }

  const handleDeleteEvent = async (eventId: string) => {
    await deleteEventById(eventId)
    getEvents(calendar.view(), calendar.selectedDate(), canAdmin(), true)
  }

  // Handler pour ouvrir la modale unifiée
  const openDayDetailsModal = async (day: Date, event?: CalendarEvent) => {
    // Recharger les présences pour ce jour spécifique
    await presenceCtrl.getPresences('day', day)

    // Récupérer les informations du jour depuis le calendrier
    const calendarDays = calendar.calendarDays()
    const dayInfo = calendarDays.find(d => {
      const d1 = d.date.toISOString().split('T')[0]
      const d2 = day.toISOString().split('T')[0]
      return d1 === d2
    })

    modal.open({
      title: dayInfo?.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || 'Détails du jour', // Le titre est géré dans la modale
      content: (
        <DayDetailsModal
          day={day}
          dayInfo={dayInfo}
          event={event}
          presenceCtrl={presenceCtrl}
          onCreatePresence={handlePresenceCreate}
          onUpdatePresence={handlePresenceUpdate}
          onDeletePresence={handlePresenceDelete}
          onToggleRefuse={async (id, refused) => {
            await presenceCtrl.toggleRefuse(id, refused)
            await presenceCtrl.getPresences('day', day)
          }}
          onDeleteEvent={canAdmin() ? handleDeleteEvent : undefined}
          onClose={() => modal.close()}
        />
      ),
      size: 'lg',
      closable: true,
    })
  }

  // Handler pour créer/modifier une présence depuis le calendrier
  const handlePresenceClick = (day: Date) => {
    openDayDetailsModal(day)
  }

  // Handler pour cliquer sur un item (événement ou présence)
  const handleItemClick = (event: CalendarEvent) => {
    // Déterminer la date de l'événement/présence
    let eventDate = event.startDate
    if (event.id.startsWith('presence-')) {
      const presenceId = event.id.replace('presence-', '')
      const presence = presenceCtrl.presences().find(p => p.id === presenceId)
      if (presence) {
        eventDate = new Date(presence.date)
      }
    }

    openDayDetailsModal(eventDate, event)
  }


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
              canCreateEvent={canAdmin()}
              items={allItems()}
              highlightedEventId={highlightedEventId()}
              showMembersCount={canAdmin()}
              onEventCreated={() => {
                getEvents(calendar.view(), calendar.selectedDate(), canAdmin(), true)
              }}
              onDayClick={handlePresenceClick}
              onItemClick={handleItemClick}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}

export default AdminEventsList