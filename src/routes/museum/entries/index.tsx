import { EntriesView } from "~/features/entries/entries.view"
import { useCan } from "~/features/auth/can.ctrl";
import { Show } from "solid-js";

const EntriesPage = () => {
  const can = useCan({ admin: true })

  return (
    <Show when={can()}>
      <div class="h-full w-full grid grid-rows-[auto_1fr] gap-4 relative overflow-y-auto px-4">
        <header class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">Validation des billets</h1>
        </header>
        <div class="overflow-y-auto">
          <EntriesView />
        </div>
      </div>
    </Show>
  )
}

export default EntriesPage