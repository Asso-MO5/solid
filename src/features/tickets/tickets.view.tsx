import { Show } from "solid-js"
import { Pagination } from "~/ui/pagination/pagination"
import { useTickets } from "./tickets.ctrl"
import { TicketsFilters } from "./tickets-filters"
import { TicketsTable } from "./tickets-table"

export const TicketsView = () => {
  const ctrl = useTickets()

  return (
    <div class="grid grid-rows-[auto_1fr_auto] h-full gap-4">
      {/* Filtres */}
      <TicketsFilters ctrl={ctrl} />

      {/* Tableau */}
      <Show when={ctrl.isLoading() && ctrl.isFetching()}>
        <div class="flex items-center justify-center p-8">
          <div class="text-gray-500">Chargement des billets...</div>
        </div>
      </Show>

      <Show when={!ctrl.isFetching()}>
        <div class="relative h-full">
          <div class="absolute inset-0 overflow-y-auto">
            <TicketsTable ctrl={ctrl} />
          </div>
        </div>


        <Pagination
          currentPage={ctrl.filter().page}
          totalPages={ctrl.totalPages()}
          limit={ctrl.filter().limit}
          isLoading={ctrl.isLoading()}
          onPageChange={(page: number) => ctrl.setFilter({ page }, true)}
          onLimitChange={(limit: number) => ctrl.setFilter({ limit }, true)}
        />

      </Show>
    </div>
  )
}

