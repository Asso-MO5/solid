import { For, Show } from "solid-js"
import { useMuseumPresence } from "./museum-presence.ctrl"
import { useCan } from "~/features/auth/can.ctrl"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { MuseumPresenceDayModal } from "./museum-presence-day.modal"
import type { MuseumPresenceDay } from "./museum-presence.types"

export const MuseumPresenceView = () => {
  const ctrl = useMuseumPresence()
  const canAdmin = useCan({ bureau: true })
  const modal = ModalCtrl()

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const isToday = (dateStr: string): boolean => {
    const today = new Date()
    const date = new Date(dateStr)
    return today.toDateString() === date.toDateString()
  }

  const isPast = (dateStr: string): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  const openPresencesModal = (day: MuseumPresenceDay) => {
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    }

    modal.open({
      title: `Présences - ${formatDate(day.date)}`,
      content: (
        <MuseumPresenceDayModal
          day={day}
          onToggleRefuse={ctrl.toggleRefuse}
          isLoading={ctrl.isLoading()}
        />
      ),
      size: 'md',
      closable: true,
    })
  }

  return (
    <div class="h-full w-full grid grid-rows-[auto_1fr] gap-6 overflow-hidden">
      <header>
        <h1 class="text-2xl font-bold text-gray-900">Présence au musée</h1>
        <p class="text-gray-600 mt-2">
          Indiquez votre présence pour les prochaines semaines. Les présences sont toujours pour l'après-midi.
        </p>
      </header>

      <div class="relative w-full h-full">
        <div class="absolute inset-0 overflow-y-auto px-2">
          <Show when={ctrl.error()}>
            <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {ctrl.error()}
            </div>
          </Show>

          <Show when={ctrl.isFetching()}>
            <div class="text-center py-8 text-gray-500">
              Chargement...
            </div>
          </Show>

          <Show when={!ctrl.isFetching()}>
            <div class="space-y-6">
              <For each={ctrl.weeks()}>
                {(week) => (
                  <div class="flex flex-col md:grid md:grid-cols-7 gap-2">
                    <For each={week}>
                      {(day) => {
                        const past = isPast(day.date)
                        const today = isToday(day.date)

                        const iAmPresent = day.my_presence && !day.my_presence.refused

                        return (
                          <div
                            data-is-today={today}
                            data-is-past={past}
                            data-is-open={day.is_open}
                            data-has-presences={day.all_presences && (day.all_presences.length ?? 0) > 0}
                            data-i-am-present={iAmPresent}
                            class="
                              border rounded-md p-3 flex flex-col gap-4 border-primary/20 bg-white
                              justify-between min-h-36
                              data-[is-today=true]:ring-2 data-[is-today=true]:ring-primary data-[is-today=true]:data-[i-am-present=true]:ring-green-600  
                              data-[i-am-present=true]:bg-green-50 data-[i-am-present=true]:border-green-600
                              data-[is-open=false]:border-secondary data-[is-open=false]:bg-secondary/10
                              data-[is-past=true]:opacity-60
                            "

                          >
                            <div class="flex items-center justify-between">
                              <div class="flex justify-between w-full items-center">
                                <span class="text-xs font-medium text-gray-500">
                                  {day.day_name}
                                </span>
                                <span class="text-sm font-semibold text-gray-900">
                                  {formatDate(day.date)}
                                </span>
                              </div>
                              <Show when={!day.is_open}>
                                <span class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Fermé
                                </span>
                              </Show>
                            </div>

                            <Show when={canAdmin() && day.all_presences && (day.all_presences.length ?? 0) > 0}>
                              <button
                                type="button"
                                onClick={() => openPresencesModal(day)}
                                class="text-xs ghost"
                              >
                                Voir présences ({day.all_presences?.length ?? 0})
                              </button>
                            </Show>

                            <Show when={day.is_open && !past}>
                              <div class="flex items-center gap-2 justify-center">
                                <button
                                  class={`${iAmPresent ? 'secondary text-xs' : ''} text-sm`}
                                  onClick={() => ctrl.togglePresence(day.date)} aria-busy={ctrl.isLoading()} disabled={ctrl.isLoading()}>{
                                    !iAmPresent ? 'Je suis Présent(e)' : 'Annuler ma présence'
                                  }</button>
                              </div>
                            </Show>
                            <Show when={day.my_presence && day.my_presence.refused}>
                              <span class="text-xs text-secondary font-medium">
                                Refusée
                              </span>
                            </Show>
                          </div>
                        )
                      }}
                    </For>
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

