import { For, Show } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import type { GiftCodesCtrlReturn, GiftCodePack, DistributePackData } from "./gift-codes.types"
import { GiftCodesDistributeModal } from "./gift-codes-distribute.modal"

interface GiftCodesTableProps {
  ctrl: GiftCodesCtrlReturn
  onCreatePack: () => void
}


const COLUMNS = [
  {
    label: 'Notes',
    accessorKey: 'notes'
  },
  {
    label: 'Codes',
    accessorKey: 'codes_count'
  },
  {
    label: 'Non utilisés',
    accessorKey: 'unused_count'
  },
  {
    label: 'Expirés',
    accessorKey: 'expired_count'
  },
  {
    label: '% Utilisé',
    accessorKey: 'usage_percentage'
  },
  {
    label: 'Créé le',
    accessorKey: 'created_at'
  },
  {
    label: 'Actions',
    accessorKey: 'actions'
  }
]
export const GiftCodesTable = (props: GiftCodesTableProps) => {
  const modal = ModalCtrl()

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUsagePercentage = (pack: GiftCodePack) => {
    if (pack.codes_count === 0) return 0
    return Math.round((pack.used_count / pack.codes_count) * 100)
  }


  const handleDistribute = (pack: GiftCodePack) => {
    const distributePack = async (data: DistributePackData) => {
      await props.ctrl.distributePack(pack.pack_id, data)
      modal.close()
    }

    const handleCancel = () => {
      modal.close()
    }

    modal.open({
      title: `Distribuer le pack ${pack.pack_id}`,
      content: (
        <GiftCodesDistributeModal
          pack={pack}
          onDistribute={distributePack}
          onCancel={handleCancel}
        />
      ),
      size: 'lg',
      closable: true,
      onClose: handleCancel
    })
  }

  return (
    <table class="w-full border-collapse">
      <thead class="w-full border-collapse">
        <tr class="border-b border-gray-200 bg-gray-50">
          <For each={COLUMNS}>
            {(column) => (
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">{column.label}</th>
            )}
          </For>
        </tr>
      </thead>
      <tbody>
        <Show
          when={props.ctrl.packs().length > 0}
          fallback={
            <tr>
              <td colSpan={8} class="px-4 py-8 text-center text-gray-500">
                <Show
                  when={props.ctrl.isLoading()}
                  fallback="Aucun pack trouvé"
                >
                  Chargement...
                </Show>
              </td>
            </tr>
          }
        >
          <For each={props.ctrl.packs()}>
            {(pack) => {
              const usagePercent = getUsagePercentage(pack)
              return (
                <tr class="border-b border-gray-100 hover:bg-gray-50">
                  <td
                    title={pack.title || ''}
                    class="px-4 py-3 text-sm font-mono truncate max-w-[200px]">
                    <Show when={pack.isPaid}>
                      <span class="text-green-600 text-xs mr-2">Paid</span>
                    </Show>
                    {pack.title || '--'}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    {pack.codes_count}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span class="text-green-600 font-medium">{pack.used_count}</span>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span class="text-blue-600 font-medium">{pack.unused_count}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                        <div
                          class="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <span class="text-sm text-gray-600 min-w-[40px]">{usagePercent}%</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">
                    {formatDate(pack.created_at)}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <button
                        onClick={() => handleDistribute(pack)}
                        disabled={pack.unused_count === 0 || props.ctrl.isLoading()}
                        class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Distribuer par email"
                      >
                        Envoyer
                      </button>
                      <button
                        onClick={() => props.ctrl.copyUnusedCodes(pack)}
                        disabled={pack.unused_count === 0 || props.ctrl.isLoading() || !pack.isPaid}
                        class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                        title="Copier les codes non utilisés"
                      >
                        Copier les codes
                      </button>
                    </div>
                  </td>
                </tr>
              )
            }}
          </For>
        </Show>
      </tbody>
    </table >

  )
}

