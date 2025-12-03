import { Show } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { Pagination } from "~/ui/pagination/pagination"
import { useSpecialPeriods } from "./special-periods.ctrl"
import { SpecialPeriodsFilters } from "./special-periods-filters"
import { SpecialPeriodsTable } from "./special-periods-table"
import { SpecialPeriodsFormModal } from "./special-periods-form.modal"
import type { CreatePeriodData } from "./special-periods.types"

export const SpecialPeriodsView = () => {
  const ctrl = useSpecialPeriods()
  const modal = ModalCtrl()

  const handleCreate = async (data: CreatePeriodData) => {
    await ctrl.createPeriod(data)
    modal.close()
  }

  const handleCreatePeriod = () => {
    modal.open({
      title: 'Créer une période spéciale',
      content: (
        <SpecialPeriodsFormModal
          onSave={handleCreate}
          onCancel={() => modal.close()}
        />
      ),
      size: 'lg',
      closable: true,
      onClose: () => modal.close()
    })
  }

  return (
    <div class="w-full h-full relative grid grid-rows-[auto_auto_1fr_auto] gap-4">
      <div class="flex items-center justify-end">
        <button
          onClick={handleCreatePeriod}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Créer une période
        </button>
      </div>

      <SpecialPeriodsFilters ctrl={ctrl} />

      <Show when={ctrl.isLoading() && ctrl.isFetching()}>
        <div class="flex items-center justify-center p-8">
          <div class="text-gray-500">Chargement des périodes spéciales...</div>
        </div>
      </Show>

      <Show when={!ctrl.isFetching()}>
        <div class="relative h-full overflow-y-auto">
          <div class="bg-white rounded-lg border border-gray-200">
            <SpecialPeriodsTable ctrl={ctrl} onCreatePeriod={handleCreatePeriod} />
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

