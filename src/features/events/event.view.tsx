import { Show, For, createSignal, createMemo } from "solid-js"
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
  slots?: EventSlot[]
  [key: string]: unknown
}

interface EventSlot {
  id: string
  eventId: string
  date: string
  startTime: string
  endTime: string
  type: 'installation' | 'horaire' | 'membre'
  access: 'public' | 'staff' | 'member' | 'staff_and_public' | 'invitation_only'
  maxCapacity: number
  minCapacity: number
  description?: string
  isActive: boolean
  isOpenForRegistration: boolean
  registrations?: EventRegistration[]
}

interface EventRegistration {
  id: string
  memberId: string
  slotId: string
  status: 'registered' | 'waiting' | 'cancelled'
  registrationRole: 'staff' | 'public' | 'member'
  registeredAt: string
  isPreferred: boolean
  canSwitch: boolean
  member?: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
}

interface EventViewProps {
  event: Event | null
  loading: boolean
  error: string | null
  isAdmin?: boolean
}

export function EventView(props: EventViewProps) {
  const [activeTab, setActiveTab] = createSignal<'overview' | 'schedule' | 'registrations' | 'management'>('overview')
  const [selectedDate, setSelectedDate] = createSignal<string>('')
  const [viewMode, setViewMode] = createSignal<'week' | 'day'>('week')

  // Générer les dates entre startDate et endDate
  const eventDates = createMemo(() => {
    if (!props.event) return []

    const dates = []
    const start = new Date(props.event.startDate)
    const end = new Date(props.event.endDate)

    // Normaliser les dates (enlever les heures)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const current = new Date(start)
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]) // YYYY-MM-DD
      current.setDate(current.getDate() + 1)
    }

    return dates
  })

  // Grouper les créneaux par date
  const slotsByDate = createMemo(() => {
    if (!props.event?.slots) {
      // Retourner un objet avec toutes les dates de l'événement, même vides
      return eventDates().reduce((acc, date) => {
        acc[date] = []
        return acc
      }, {} as Record<string, EventSlot[]>)
    }

    // Grouper les créneaux existants
    const grouped = props.event.slots.reduce((acc, slot) => {
      const date = slot.date.split('T')[0] // YYYY-MM-DD
      if (!acc[date]) acc[date] = []
      acc[date].push(slot)
      return acc
    }, {} as Record<string, EventSlot[]>)

    // S'assurer que toutes les dates de l'événement sont présentes
    eventDates().forEach(date => {
      if (!grouped[date]) {
        grouped[date] = []
      }
    })

    return grouped
  })

  // Dates disponibles (toutes les dates de l'événement)
  const availableDates = createMemo(() => {
    return eventDates()
  })

  // Créneaux du jour sélectionné
  const daySlots = createMemo(() => {
    const date = selectedDate() || availableDates()[0]
    return slotsByDate()[date] || []
  })

  return (
    <div class="relative h-full">
      <div class="max-w-7xl mx-auto p-6 absolute inset-0 overflow-y-auto">
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
            <div class="space-y-6">
              {/* Header de l'événement */}
              <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div
                  class="h-2 w-full"
                  style={{ 'background-color': event().color || '#3b82f6' }}
                />

                <div class="p-6">
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

                  {/* Onglets de navigation */}
                  <div class="border-b border-gray-200">
                    <nav class="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('overview')}
                        class={`btn`}
                      >
                        Vue d'ensemble
                      </button>
                      <button
                        onClick={() => setActiveTab('schedule')}
                        class={`btn`}
                      >
                        Planning & Créneaux
                      </button>
                      <button
                        onClick={() => setActiveTab('registrations')}
                        class="btn"
                      >
                        Inscriptions
                      </button>
                      <Show when={props.isAdmin}>
                        <button
                          onClick={() => setActiveTab('management')}
                          class={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab() === 'management'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          Gestion Admin
                        </button>
                      </Show>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Contenu des onglets */}
              <Show when={activeTab() === 'overview'}>
                <EventOverview event={event()} />
              </Show>

              <Show when={activeTab() === 'schedule'}>
                <EventSchedule
                  event={event()}
                  slotsByDate={slotsByDate()}
                  availableDates={availableDates()}
                  selectedDate={selectedDate()}
                  setSelectedDate={setSelectedDate}
                  viewMode={viewMode()}
                  setViewMode={setViewMode}
                  daySlots={daySlots()}
                  isAdmin={props.isAdmin}
                />
              </Show>

              <Show when={activeTab() === 'registrations'}>
                <EventRegistrations
                  event={event()}
                  slotsByDate={slotsByDate()}
                  isAdmin={props.isAdmin}
                />
              </Show>

              <Show when={activeTab() === 'management' && props.isAdmin}>
                <EventManagement
                  event={event()}
                  slotsByDate={slotsByDate()}
                />
              </Show>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}

// ============================================================================
// COMPOSANT: Vue d'ensemble
// ============================================================================
function EventOverview(props: { event: Event }) {
  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Vue d'ensemble</h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informations de base */}
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
          <div class="space-y-4">
            <Show when={props.event.description}>
              <div>
                <h4 class="font-medium text-gray-700 mb-2">Description</h4>
                <p class="text-gray-600 whitespace-pre-wrap">{props.event.description}</p>
              </div>
            </Show>

            <div>
              <h4 class="font-medium text-gray-700 mb-2">Horaires</h4>
              <div class="space-y-1">
                <div>
                  <span class="text-gray-600">Début :</span>
                  <span class="ml-2 font-medium">
                    {new Date(props.event.startDate).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span class="text-gray-600">Fin :</span>
                  <span class="ml-2 font-medium">
                    {new Date(props.event.endDate).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="font-medium text-gray-700 mb-2">Accès</h4>
              <div class="space-y-1">
                <div>
                  <span class="text-gray-600">Rôles autorisés :</span>
                  <span class="ml-2 font-medium">
                    {props.event.allowedRoles?.length > 0
                      ? props.event.allowedRoles.join(', ')
                      : 'Public'
                    }
                  </span>
                </div>
                <Show when={props.event.isConfidential}>
                  <div class="text-amber-600 font-medium">
                    ⚠️ Événement confidentiel
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">
                {props.event.slots?.length || 0}
              </div>
              <div class="text-sm text-blue-800">Créneaux</div>
            </div>

            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-green-600">
                {props.event.slots?.reduce((total, slot) =>
                  total + (slot.registrations?.length || 0), 0) || 0}
              </div>
              <div class="text-sm text-green-800">Inscriptions</div>
            </div>

            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-purple-600">
                {props.event.slots?.reduce((total, slot) =>
                  total + (slot.registrations?.filter(r => r.status === 'registered').length || 0), 0) || 0}
              </div>
              <div class="text-sm text-purple-800">Confirmées</div>
            </div>

            <div class="bg-orange-50 p-4 rounded-lg">
              <div class="text-2xl font-bold text-orange-600">
                {props.event.slots?.reduce((total, slot) =>
                  total + (slot.registrations?.filter(r => r.status === 'waiting').length || 0), 0) || 0}
              </div>
              <div class="text-sm text-orange-800">En attente</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <Show when={props.event.externalUrl || props.event.plan || props.event.internalNotes}>
        <div class="mt-8 pt-6 border-t">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations supplémentaires</h3>
          <div class="space-y-4">
            <Show when={props.event.externalUrl}>
              <div>
                <span class="font-medium text-gray-700">Lien externe :</span>
                <a
                  href={props.event.externalUrl as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  {(props.event.externalName as string) || (props.event.externalUrl as string)}
                </a>
              </div>
            </Show>

            <Show when={props.event.plan}>
              <div>
                <span class="font-medium text-gray-700">Plan :</span>
                <div class="mt-2 p-3 bg-gray-50 rounded-lg">
                  <pre class="whitespace-pre-wrap text-sm text-gray-700">{props.event.plan as string}</pre>
                </div>
              </div>
            </Show>

            <Show when={props.event.internalNotes}>
              <div>
                <span class="font-medium text-gray-700">Notes internes :</span>
                <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p class="text-sm text-amber-800">{props.event.internalNotes as string}</p>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}

// ============================================================================
// COMPOSANT: Planning & Créneaux
// ============================================================================
function EventSchedule(props: {
  event: Event
  slotsByDate: Record<string, EventSlot[]>
  availableDates: string[]
  selectedDate: string
  setSelectedDate: (date: string) => void
  viewMode: 'week' | 'day'
  setViewMode: (mode: 'week' | 'day') => void
  daySlots: EventSlot[]
  isAdmin?: boolean
}) {
  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Planning & Créneaux</h2>

        <div class="flex gap-4">
          {/* Sélecteur de vue */}
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => props.setViewMode('week')}
              class={`px-3 py-1 rounded-md text-sm font-medium ${props.viewMode === 'week'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Semaine
            </button>
            <button
              onClick={() => props.setViewMode('day')}
              class={`px-3 py-1 rounded-md text-sm font-medium ${props.viewMode === 'day'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Jour
            </button>
          </div>

          {/* Bouton d'ajout de créneau (admin) */}
          <Show when={props.isAdmin}>
            <button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              + Ajouter un créneau
            </button>
          </Show>
        </div>
      </div>

      {/* Sélecteur de date */}
      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <For each={props.availableDates}>
            {(date) => (
              <button
                onClick={() => props.setSelectedDate(date)}
                class={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${props.selectedDate === date
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {new Date(date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Affichage des créneaux */}
      <Show when={props.viewMode === 'day'}>
        <DayView slots={props.daySlots} isAdmin={props.isAdmin} />
      </Show>

      <Show when={props.viewMode === 'week'}>
        <WeekView slotsByDate={props.slotsByDate} isAdmin={props.isAdmin} />
      </Show>
    </div>
  )
}

// ============================================================================
// COMPOSANT: Vue jour
// ============================================================================
function DayView(props: { slots: EventSlot[], isAdmin?: boolean }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div class="space-y-4">
      {/* Vue grille horaire */}
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Planning du jour</h3>
        </div>

        <div class="max-h-[600px] overflow-y-auto">
          <For each={hours}>
            {(hour) => {
              const slotsAtHour = props.slots.filter(slot => {
                const slotStartHour = new Date(slot.startTime).getHours()
                const slotEndHour = new Date(slot.endTime).getHours()
                return slotStartHour <= hour && slotEndHour > hour
              })

              return (
                <div class="flex border-b border-gray-100 hover:bg-gray-50">
                  {/* Heure */}
                  <div class="w-20 p-3 text-sm text-gray-500 font-mono border-r border-gray-200 bg-gray-50">
                    {hour.toString().padStart(2, '0')}:00
                  </div>

                  {/* Créneaux */}
                  <div class="flex-1 p-3 relative min-h-[60px]">
                    <Show when={slotsAtHour.length === 0}>
                      <Show when={props.isAdmin}>
                        <button class="w-full h-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors">
                          <span class="text-sm">+ Ajouter un créneau</span>
                        </button>
                      </Show>
                    </Show>

                    <For each={slotsAtHour}>
                      {(slot) => (
                        <div class={`p-3 rounded-lg border mb-2 last:mb-0 ${slot.type === 'installation' ? 'bg-blue-50 border-blue-200' :
                          slot.type === 'horaire' ? 'bg-green-50 border-green-200' :
                            'bg-purple-50 border-purple-200'
                          }`}>
                          <div class="flex justify-between items-start">
                            <div class="flex-1">
                              <div class="flex items-center gap-3 mb-2">
                                <span class="font-medium text-gray-900">
                                  {new Date(slot.startTime).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {new Date(slot.endTime).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>

                                <span class={`px-2 py-1 rounded-full text-xs font-medium ${slot.type === 'installation' ? 'bg-blue-100 text-blue-800' :
                                  slot.type === 'horaire' ? 'bg-green-100 text-green-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                  {slot.type === 'installation' ? 'Installation' :
                                    slot.type === 'horaire' ? 'Horaire' : 'Membre'}
                                </span>

                                <span class={`px-2 py-1 rounded-full text-xs font-medium ${slot.access === 'public' ? 'bg-gray-100 text-gray-800' :
                                  slot.access === 'staff' ? 'bg-red-100 text-red-800' :
                                    slot.access === 'member' ? 'bg-blue-100 text-blue-800' :
                                      slot.access === 'staff_and_public' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-purple-100 text-purple-800'
                                  }`}>
                                  {slot.access === 'public' ? 'Public' :
                                    slot.access === 'staff' ? 'Staff' :
                                      slot.access === 'member' ? 'Membre' :
                                        slot.access === 'staff_and_public' ? 'Staff + Public' :
                                          'Sur invitation'}
                                </span>
                              </div>

                              <Show when={slot.description}>
                                <p class="text-gray-600 text-sm mb-2">{slot.description}</p>
                              </Show>

                              <div class="flex items-center gap-4 text-sm text-gray-500">
                                <span>Capacité: {slot.registrations?.length || 0}/{slot.maxCapacity}</span>
                                <Show when={slot.minCapacity > 0}>
                                  <span>Min: {slot.minCapacity}</span>
                                </Show>
                                <Show when={!slot.isOpenForRegistration}>
                                  <span class="text-red-600">Inscriptions fermées</span>
                                </Show>
                              </div>

                              {/* Liste des participants */}
                              <Show when={slot.registrations && slot.registrations.length > 0}>
                                <div class="mt-3 pt-3 border-t border-gray-200">
                                  <h4 class="text-sm font-medium text-gray-700 mb-2">Participants</h4>
                                  <div class="flex flex-wrap gap-2">
                                    <For each={slot.registrations}>
                                      {(registration) => (
                                        <div class={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${registration.status === 'registered' ? 'bg-green-100 text-green-800' :
                                          registration.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                          <Show when={registration.member?.avatar}>
                                            <img
                                              src={registration.member?.avatar}
                                              alt=""
                                              class="w-4 h-4 rounded-full"
                                            />
                                          </Show>
                                          <span>{registration.member?.displayName || 'Membre'}</span>
                                          <Show when={registration.isPreferred}>
                                            <span class="text-yellow-600">⭐</span>
                                          </Show>
                                        </div>
                                      )}
                                    </For>
                                  </div>
                                </div>
                              </Show>
                            </div>

                            <div class="flex gap-2">
                              <Show when={props.isAdmin}>
                                <button class="text-gray-400 hover:text-gray-600">
                                  ✏️
                                </button>
                                <button class="text-gray-400 hover:text-red-600">
                                  🗑️
                                </button>
                              </Show>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              )
            }}
          </For>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPOSANT: Vue semaine
// ============================================================================
function WeekView(props: { slotsByDate: Record<string, EventSlot[]>, isAdmin?: boolean }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const dates = createMemo(() => Object.keys(props.slotsByDate).sort())

  return (
    <div class="overflow-x-auto">
      <div class="min-w-full">
        {/* En-tête avec les dates */}
        <div class={`grid gap-1 mb-2`} style={{ 'grid-template-columns': `120px repeat(${dates().length}, 1fr)` }}>
          <div class="p-2 text-sm font-medium text-gray-500">Heure</div>
          <For each={dates()}>
            {(date) => (
              <div class="p-2 text-sm font-medium text-gray-700 text-center border-l border-gray-200">
                <div class="font-semibold">
                  {new Date(date).toLocaleDateString('fr-FR', {
                    weekday: 'short'
                  })}
                </div>
                <div class="text-xs text-gray-500">
                  {new Date(date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Grille des heures */}
        <For each={hours}>
          {(hour) => (
            <div class={`grid gap-1 border-b border-gray-100 hover:bg-gray-50`} style={{ 'grid-template-columns': `120px repeat(${dates().length}, 1fr)` }}>
              <div class="p-2 text-sm text-gray-500 text-right font-mono">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <For each={dates()}>
                {(date) => {
                  const slotsAtHour = props.slotsByDate[date].filter(slot => {
                    const slotStartHour = new Date(slot.startTime).getHours()
                    const slotEndHour = new Date(slot.endTime).getHours()
                    // Vérifier si le créneau couvre cette heure
                    return slotStartHour <= hour && slotEndHour > hour
                  })

                  return (
                    <div class="p-1 min-h-[60px] border-l border-gray-200 relative">
                      <Show when={slotsAtHour.length === 0}>
                        {/* Cellule vide - zone cliquable pour ajouter un créneau */}
                        <Show when={props.isAdmin}>
                          <button class="w-full h-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded transition-colors">
                            <span class="text-xs">+</span>
                          </button>
                        </Show>
                      </Show>

                      <For each={slotsAtHour}>
                        {(slot) => {
                          const slotStart = new Date(slot.startTime)
                          const slotEnd = new Date(slot.endTime)
                          const startHour = slotStart.getHours()
                          const startMinute = slotStart.getMinutes()
                          const endHour = slotEnd.getHours()
                          const endMinute = slotEnd.getMinutes()

                          // Calculer la position et la hauteur du créneau
                          const topOffset = startMinute / 60 * 60 // 60px par heure
                          const duration = (endHour - startHour) * 60 + (endMinute - startMinute)
                          const height = (duration / 60) * 60 // 60px par heure

                          return (
                            <div
                              class={`absolute left-1 right-1 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${slot.type === 'installation' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                slot.type === 'horaire' ? 'bg-green-100 text-green-800 border border-green-200' :
                                  'bg-purple-100 text-purple-800 border border-purple-200'
                                }`}
                              style={{
                                top: `${topOffset}px`,
                                height: `${height}px`,
                                'min-height': '20px'
                              }}
                            >
                              <div class="p-1 h-full flex flex-col justify-between">
                                <div class="font-medium text-xs">
                                  {slotStart.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {slotEnd.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>

                                <Show when={slot.description}>
                                  <div class="text-xs opacity-75 truncate">
                                    {slot.description}
                                  </div>
                                </Show>

                                <div class="flex justify-between items-end text-xs">
                                  <span class="opacity-75">
                                    {slot.registrations?.length || 0}/{slot.maxCapacity}
                                  </span>
                                  <span class={`px-1 rounded text-xs ${slot.access === 'public' ? 'bg-gray-200' :
                                    slot.access === 'staff' ? 'bg-red-200' :
                                      slot.access === 'member' ? 'bg-blue-200' :
                                        slot.access === 'staff_and_public' ? 'bg-yellow-200' :
                                          'bg-purple-200'
                                    }`}>
                                    {slot.access === 'public' ? 'P' :
                                      slot.access === 'staff' ? 'S' :
                                        slot.access === 'member' ? 'M' :
                                          slot.access === 'staff_and_public' ? 'S+P' :
                                            'I'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        }}
                      </For>
                    </div>
                  )
                }}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

// ============================================================================
// COMPOSANT: Inscriptions
// ============================================================================
function EventRegistrations(_props: {
  event: Event
  slotsByDate: Record<string, EventSlot[]>
  isAdmin?: boolean
}) {
  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Inscriptions</h2>

      <div class="text-center py-12 text-gray-500">
        Interface d'inscription en cours de développement...
      </div>
    </div>
  )
}

// ============================================================================
// COMPOSANT: Gestion Admin
// ============================================================================
function EventManagement(_props: {
  event: Event
  slotsByDate: Record<string, EventSlot[]>
}) {
  return (
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Gestion Administrative</h2>

      <div class="text-center py-12 text-gray-500">
        Interface de gestion admin en cours de développement...
      </div>
    </div>
  )
}