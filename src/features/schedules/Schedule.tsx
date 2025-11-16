import { For, Show } from "solid-js"
import { days } from "./schedule.const"
import type { AudienceType, DayOfWeek } from "./schedules.types"
import { useSchedule } from "./schedule.ctrl"
import { ScheduleDeleteModal } from "./Schedule-delete.modal"

interface ScheduleProps {
  type: AudienceType
}

export const Schedule = (props: ScheduleProps) => {
  const ctrl = useSchedule(() => props.type)

  return (
    <div class="space-y-4 mt-4">
      <Show when={ctrl.isLoading()}>
        <div class="flex items-center justify-center h-full">
          Chargement des horaires...
        </div>
      </Show>
      <Show when={!ctrl.isLoading()}>
        <For each={days}>
          {(day) => {
            const dayOfWeek = day.id as DayOfWeek
            const schedule = () => ctrl.schedules()[dayOfWeek]
            const isEditing = () => ctrl.editingDay() === dayOfWeek


            return (
              <div class="flex items-center gap-4 p-2 border border-gray-200 rounded-lg">
                <div class="w-24 font-medium">
                  {day.label}
                </div>
                <Show
                  when={isEditing()}
                  fallback={
                    <>
                      {/* Affichage des horaires en mode lecture */}
                      <div class="flex-1 flex items-center gap-4" data-schedule={
                        //trigger the change state
                        schedule()}>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-600">Début:</span>
                          <span class="font-mono">
                            {schedule().startTime || '--:--'}
                          </span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-600">Fin:</span>
                          <span class="font-mono">
                            {schedule().endTime || '--:--'}
                          </span>
                        </div>
                      </div>
                      <ScheduleDeleteModal
                        onDelete={() => ctrl.deleteSchedule(dayOfWeek)}
                        isLoading={ctrl.isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => ctrl.startEdit(dayOfWeek)}
                      >
                        Éditer
                      </button>
                    </>
                  }
                >
                  {/* Mode édition */}
                  <div class="flex-1 flex items-center gap-4">
                    <div class="flex items-center gap-2">
                      <label for={`start-${dayOfWeek}`} class="text-sm text-gray-600">
                        Début:
                      </label>
                      <input
                        id={`start-${dayOfWeek}`}
                        type="time"
                        value={ctrl.editValues().startTime}
                        onInput={(e) => ctrl.updateEditValue('startTime', e.currentTarget.value)}
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <label for={`end-${dayOfWeek}`} class="text-sm text-gray-600">
                        Fin:
                      </label>
                      <input
                        id={`end-${dayOfWeek}`}
                        type="time"
                        value={ctrl.editValues().endTime}
                        onInput={(e) => ctrl.updateEditValue('endTime', e.currentTarget.value)}
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Boutons Annuler / Enregistrer */}
                  <div class="flex gap-2">
                    <button
                      type="button"
                      onClick={ctrl.cancelEdit}
                      class="secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => ctrl.saveEdit(dayOfWeek)}

                    >
                      Enregistrer
                    </button>
                  </div>
                </Show>
              </div>
            )
          }}
        </For>
      </Show>
    </div>
  )
}
