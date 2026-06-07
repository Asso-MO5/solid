import { For, Show, createSignal } from "solid-js"
import { StaffPresenceFormModal } from "~/features/staff-presence/staff-presence-form.modal"
import type { CalendarDay, CalendarEvent } from "~/ui/Cal/Cal.types"
import type { CreatePresenceData, UpdatePresenceData } from "~/features/staff-presence/staff-presence.types"
import { useCan } from "~/features/auth/can.ctrl"
import type { StaffPresenceCtrlReturn } from "~/features/staff-presence/staff-presence.types"

interface DayDetailsModalProps {
  day: Date
  dayInfo?: CalendarDay
  event?: CalendarEvent
  presenceCtrl: StaffPresenceCtrlReturn
  onCreatePresence?: (data: CreatePresenceData) => Promise<void>
  onUpdatePresence?: (id: string, data: UpdatePresenceData) => Promise<void>
  onDeletePresence?: (id: string) => Promise<void>
  onToggleRefuse?: (id: string, refused: boolean) => Promise<void>
  onClose: () => void
}

type Tab = 'presence' | 'info' | 'members'

const PERIOD_LABELS: Record<string, string> = {
  morning: 'Matin',
  afternoon: 'Après-midi',
  both: 'Journée complète',
}

export const DayDetailsModal = (props: DayDetailsModalProps) => {
  const canMember = useCan({ member: true })
  const canAdmin = useCan({ bureau: true })

  // Déterminer l'onglet initial
  const getInitialTab = (): Tab => {
    if (canMember() && !props.event) {
      return 'presence'
    }
    if (props.event && props.event.id.startsWith('presence-')) {
      return 'presence'
    }
    return 'info'
  }

  const [activeTab, setActiveTab] = createSignal<Tab>(getInitialTab())

  // Calculer dateStr de manière réactive (sans décalage de fuseau horaire)
  const dateStr = () => {
    const d = props.day
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const existingPresence = () => props.presenceCtrl.presences().find(p => p.date === dateStr())

  // Récupérer toutes les présences pour ce jour (pour les admins)
  const dayPresences = () => {
    const allDays = props.presenceCtrl.days()
    const currentDateStr = dateStr()
    const dayData = allDays.find(d => d.date === currentDateStr)
    return dayData?.presences || []
  }

  return (
    <div class="flex flex-col gap-4 max-w-3xl mx-auto">
      {/* Tabs */}
      <div class="flex gap-4 overflow-x-auto">
        <Show when={canMember()}>
          <button
            data-active={activeTab() === 'presence'}
            class="
            border-t-transparent border-l-transparent border-r-transparent border-b-4 
            rounded-none bg-transparent border-b-primary
            data-[active=true]:border-b-secondary data-[active=true]:bg-white
            data-[active=true]:text-secondary "
            onClick={() => setActiveTab('presence')}
          >
            Ma présence
          </button>
        </Show>
        <button
          onClick={() => setActiveTab('info')}
          data-active={activeTab() === 'info'}
          class="
          border-t-transparent border-l-transparent border-r-transparent border-b-4 
          rounded-none bg-transparent border-b-primary
          data-[active=true]:border-b-secondary data-[active=true]:bg-white
          data-[active=true]:text-secondary "
        >
          Informations
        </button>
        <Show when={canAdmin()}>
          <button
            onClick={() => setActiveTab('members')}
            data-active={activeTab() === 'members'}
            class="
            border-t-transparent border-l-transparent border-r-transparent border-b-4 
            rounded-none bg-transparent border-b-primary
            data-[active=true]:border-b-secondary data-[active=true]:bg-white
            data-[active=true]:text-secondary "
          >
            Membres présents ({dayPresences().length})
          </button>
        </Show>
      </div>

      {/* Content */}
      <div class="flex-1 overflow-y-auto p-2 min-h-[40dvh]">
        <Show when={activeTab() === 'presence' && canMember()}>
          <StaffPresenceFormModal
            presence={existingPresence()}
            selectedDate={props.day}
            onCreate={async (data) => {
              await props.onCreatePresence?.(data)
            }}
            onUpdate={async (id, data) => {
              await props.onUpdatePresence?.(id, data)
            }}
            onDelete={async (id) => {
              await props.onDeletePresence?.(id)
            }}
            onCancel={() => {
              // Ne rien faire, la modale reste ouverte
            }}
          />
        </Show>

        <Show when={activeTab() === 'info'}>
          <div class="space-y-6">
            {/* Statut d'ouverture */}
            <Show when={props.dayInfo?.isOpen !== undefined}>
              <div class="flex items-center gap-3">
                <div
                  class="w-3 h-3 rounded-full"
                  data-open={props.dayInfo?.isOpen ? 'true' : 'false'}
                />
                <div>
                  <span class="text-sm font-medium text-gray-600">Statut :</span>
                  <span class="ml-2 text-gray-900">
                    {props.dayInfo?.isOpen ? 'Ouvert' : 'Fermé'}
                  </span>
                </div>
              </div>
            </Show>

            {/* Billets payés */}
            <Show when={props.dayInfo?.paid_tickets_count !== undefined && canAdmin()}>
              <div>
                <span class="text-sm font-medium text-gray-600">Billets payés :</span>
                <span class="ml-2 text-gray-900 font-semibold">
                  {props.dayInfo?.paid_tickets_count}
                </span>
              </div>
            </Show>

            {/* Membres présents (pour tous) */}
            <Show when={props.dayInfo?.members_presence_count !== undefined && props.dayInfo.members_presence_count! > 0 && canAdmin()}>
              <div>
                <span class="text-sm font-medium text-gray-600">Membres présents :</span>
                <span class="ml-2 text-gray-900 font-semibold">
                  👥 {props.dayInfo!.members_presence_count}
                </span>
              </div>
            </Show>

            {/* Horaires d'ouverture */}
            <Show when={props.dayInfo?.openingHours && props.dayInfo.openingHours.length > 0}>
              <div>
                <h3 class="text-sm font-medium text-gray-600 mb-2">Horaires d'ouverture</h3>
                <div class="space-y-2">
                  <For each={props.dayInfo!.openingHours}>
                    {(hour) => (
                      <div class="text-sm text-gray-700">
                        {hour.start_time} - {hour.end_time}
                        <Show when={hour.description}>
                          <span class="ml-2 text-gray-500">({hour.description})</span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Détails de l'événement */}
            <Show when={props.event && !props.event.id.startsWith('presence-')}>
              <div class="border-t border-gray-200 pt-6">
                <h3
                  class="text-xl font-bold text-gray-900 mb-1 pl-3 border-l-4"
                  style={{ 'border-color': props.event!.color || '#3b82f6' }}
                >
                  {props.event!.title}
                </h3>
                <Show when={props.event?.description}>
                  <p class="text-gray-600 mb-4 pl-3">{props.event!.description}</p>
                </Show>
                <div class="space-y-2">
                  <div>
                    <span class="text-sm font-medium text-gray-600">Début :</span>
                    <span class="ml-2 text-gray-900">
                      {props.event!.startDate.toLocaleDateString('fr-FR')} à{' '}
                      {props.event!.startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm font-medium text-gray-600">Fin :</span>
                    <span class="ml-2 text-gray-900">
                      {props.event!.endDate.toLocaleDateString('fr-FR')} à{' '}
                      {props.event!.endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </Show>
          </div>
        </Show>

        <Show when={activeTab() === 'members' && canAdmin()}>
          <div class="space-y-4">
            <Show when={dayPresences().length === 0}>
              <div class="text-center text-gray-500 py-8">
                Aucun membre présent pour ce jour
              </div>
            </Show>
            <Show when={dayPresences().length > 0}>
              <div class="space-y-3">
                <For each={dayPresences()}>
                  {(presence) => (
                    <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">{presence.user_name}</div>
                        <div class="text-sm text-gray-600">
                          {PERIOD_LABELS[presence.period] || presence.period}
                        </div>
                        <Show when={presence.refused}>
                          <div class="text-xs text-red-600 mt-1">Refusé par un administrateur</div>
                        </Show>
                      </div>
                      <div class="flex items-center gap-2">
                        <button

                          data-status={presence.refused ? 'accepted' : 'refused'}
                          onClick={() => props.onToggleRefuse?.(presence.id, !presence.refused)}
                          class={
                            `px-3 py-1 text-xs ${presence.refused ? 'valid' : 'secondary'}`
                          }
                        >
                          {presence.refused ? 'Accepter' : 'Refuser'}
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

