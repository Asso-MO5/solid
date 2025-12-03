import { createSignal, Show } from "solid-js"
import type { SpecialPeriod } from "./special-periods.types"

interface SpecialPeriodsDeleteModalProps {
  period: SpecialPeriod
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export const SpecialPeriodsDeleteModal = (props: SpecialPeriodsDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = createSignal<boolean>(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await props.onConfirm()
      // La modale sera fermée par onConfirm
    } catch (error) {
      // L'erreur est déjà gérée dans le contrôleur
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div class="space-y-4">
      <p class="text-gray-700">
        Êtes-vous sûr de vouloir supprimer la période spéciale <strong>{props.period.name}</strong> ?
      </p>
      <p class="text-sm text-gray-500">
        Cette action est irréversible.
      </p>

      <div class="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={() => props.onCancel()}
          disabled={isDeleting()}
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting()}
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          <Show when={isDeleting()} fallback="Supprimer">
            Suppression...
          </Show>
        </button>
      </div>
    </div>
  )
}

