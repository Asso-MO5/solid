import { Show } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { Pagination } from "~/ui/pagination/pagination"
import { useGiftCodes } from "./gift-codes.ctrl"
import { GiftCodesFilters } from "./gift-codes-filters"
import { GiftCodesTable } from "./gift-codes-table"
import { GiftCodesCreateModal } from "./gift-codes-create.modal"
import type { CreatePackData } from "./gift-codes.types"

export const GiftCodesView = () => {
  const ctrl = useGiftCodes()
  const modal = ModalCtrl()

  const handleCreate = async (data: CreatePackData) => {
    await ctrl.createPack(data)
    modal.close()
  }

  const handleCreatePack = () => {
    modal.open({
      title: 'Créer un pack de codes cadeaux',
      content: (
        <GiftCodesCreateModal
          onCreate={handleCreate}
          onCancel={() => {
            modal.close()
          }}
        />
      ),
      size: 'lg',
      closable: true,
      onClose: () => {
        // Modal fermé
      }
    })
  }

  return (
    <div class="w-full h-full  relative grid grid-rows-[auto_auto_1fr_auto] gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Codes cadeaux</h2>
        <button
          onClick={handleCreatePack}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Créer un pack
        </button>
      </div>

      <GiftCodesFilters ctrl={ctrl} />

      <Show when={ctrl.isLoading() && ctrl.isFetching()}>
        <div class="flex items-center justify-center p-8">
          <div class="text-gray-500">Chargement des packs...</div>
        </div>
      </Show>

      <Show when={!ctrl.isFetching()}>
        <div class="relative h-full overflow-y-auto">
          <div class="bg-white rounded-lg border border-gray-200">
            <GiftCodesTable ctrl={ctrl} onCreatePack={handleCreatePack} />
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

