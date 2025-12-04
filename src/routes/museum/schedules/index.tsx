import { Show } from "solid-js"
import { useCan } from "~/features/auth/can.ctrl"
import { Schedules } from "~/features/schedules/Schedules"

const SchedulesPage = () => {
  const can = useCan({ admin: true })
  return (
    <Show when={can()}>
      <div class="h-full w-full grid grid-rows-[auto_1fr] gap-4 relative">
        <header class="flex justify-between items-center gap2">
          <div class="flex items-center gap-2 flex-col md:flex-row">
            <div class="flex items-center gap-2">
              <h1 class="m-0">Horaires</h1>
            </div>
          </div>
        </header>
        <Schedules />
      </div>
    </Show>
  )
}

export default SchedulesPage