import { EntriesView } from "~/features/entries/entries.view"

const EntriesPage = () => {
  return (
    <div class="h-full w-full grid grid-rows-[auto_1fr] gap-4 relative overflow-y-auto p-4">
      <header class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Validation des billets</h1>
      </header>
      <div class="overflow-y-auto">
        <EntriesView />
      </div>
    </div>
  )
}

export default EntriesPage