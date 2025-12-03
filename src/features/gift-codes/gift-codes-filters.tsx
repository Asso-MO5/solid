import type { GiftCodesCtrlReturn } from "./gift-codes.types"

interface GiftCodesFiltersProps {
  ctrl: GiftCodesCtrlReturn
}

export const GiftCodesFilters = (props: GiftCodesFiltersProps) => {
  const filter = () => props.ctrl.filter()

  return (
    <div class="flex w-full  gap-4 items-center justify-between">
      <input
        type="text"
        value={filter().code || ''}
        onInput={(e) => {
          const value = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
          props.ctrl.setFilter({ code: value || undefined })
        }}
        placeholder="Rechercher un code..."
        class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono"
      />
      <button
        onClick={() => props.ctrl.resetFilters()}
        class="h-full"
      >
        Réinitialiser
      </button>
    </div>
  )
}

