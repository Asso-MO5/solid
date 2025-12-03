import { For, Show } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import type { SpecialPeriodsCtrlReturn, SpecialPeriod } from "./special-periods.types"
import { SpecialPeriodsDeleteModal } from "./special-periods-delete.modal"
import { SpecialPeriodsFormModal } from "./special-periods-form.modal"

interface SpecialPeriodsTableProps {
  ctrl: SpecialPeriodsCtrlReturn
  onCreatePeriod: () => void
}

export const SpecialPeriodsTable = (props: SpecialPeriodsTableProps) => {
  const modal = ModalCtrl()

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getTypeLabel = (type: SpecialPeriod['type']) => {
    switch (type) {
      case 'holiday':
        return 'Vacances'
      case 'closure':
        return 'Fermeture'
      default:
        return type
    }
  }

  const handleEdit = (period: SpecialPeriod) => {
    const handleSave = async (data: Parameters<typeof props.ctrl.updatePeriod>[1]) => {
      await props.ctrl.updatePeriod(period.id, data)
      modal.close()
    }

    const handleCancel = () => {
      modal.close()
    }

    modal.open({
      title: `Modifier la période spéciale`,
      content: (
        <SpecialPeriodsFormModal
          period={period}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ),
      size: 'lg',
      closable: true,
      onClose: handleCancel
    })
  }

  const handleDelete = (period: SpecialPeriod) => {
    const handleConfirm = async () => {
      await props.ctrl.deletePeriod(period.id)
      modal.close()
    }

    const handleCancel = () => {
      modal.close()
    }

    modal.open({
      title: 'Supprimer la période spéciale',
      content: (
        <SpecialPeriodsDeleteModal
          period={period}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ),
      size: 'md',
      closable: true,
      onClose: handleCancel
    })
  }

  return (
    <table class="w-full border-collapse">
      <thead class="sticky top-0 z-10 bg-gray-50">
        <tr class="border-b border-gray-200">
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nom</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date début</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date fin</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Zone</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Statut</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        <Show
          when={props.ctrl.periods().length > 0}
          fallback={
            <tr>
              <td colSpan={7} class="px-4 py-8 text-center text-gray-500">
                <Show
                  when={props.ctrl.isLoading()}
                  fallback="Aucune période spéciale trouvée"
                >
                  Chargement...
                </Show>
              </td>
            </tr>
          }
        >
          <For each={props.ctrl.periods()}>
            {(period) => (
              <tr class="border-b border-gray-100 hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">
                  {period.name}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span
                    data-type={period.type}
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {getTypeLabel(period.type)}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  {formatDate(period.start_date)}
                </td>
                <td class="px-4 py-3 text-sm">
                  {formatDate(period.end_date)}
                </td>
                <td class="px-4 py-3 text-sm">
                  {period.zone || '--'}
                </td>
                <td class="px-4 py-3">
                  <span
                    data-active={period.is_active}
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {period.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(period)}
                      disabled={props.ctrl.isLoading()}
                      class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Modifier"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(period)}
                      disabled={props.ctrl.isLoading()}
                      class="secondary"
                      title="Supprimer"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </For>
        </Show>
      </tbody>
    </table>
  )
}

