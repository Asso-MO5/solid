import type { SpecialPeriodsCtrlReturn } from "./special-periods.types"

interface SpecialPeriodsFiltersProps {
  ctrl: SpecialPeriodsCtrlReturn
}

export const SpecialPeriodsFilters = (props: SpecialPeriodsFiltersProps) => {
  const filter = () => props.ctrl.filter()

  return (
    <div class="flex justify-between items-center gap-2">


      <div class="flex gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Type</label>
          <select
            value={filter().type || ''}
            onChange={(e) => props.ctrl.setFilter({ type: e.currentTarget.value as 'holiday' | 'closure' || undefined }, true)}
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les types</option>
            <option value="holiday">Vacances</option>
            <option value="closure">Fermeture</option>
          </select>
        </div>

        {/* Date */}
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Date</label>
          <input
            type="date"
            value={filter().date || ''}
            onInput={(e) => props.ctrl.setFilter({ date: e.currentTarget.value || undefined }, true)}
            placeholder="YYYY-MM-DD"
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Zone */}
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Zone</label>
          <input
            type="text"
            value={filter().zone || ''}
            onInput={(e) => props.ctrl.setFilter({ zone: e.currentTarget.value || undefined })}
            placeholder="Zone (ex: A, B, C)"
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Statut actif */}
        <div class="flex flex-col gap-1">
          <label class="text-sm text-gray-600">Statut</label>
          <select
            value={filter().is_active === undefined ? '' : filter().is_active ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.currentTarget.value
              props.ctrl.setFilter({
                is_active: value === '' ? undefined : value === 'true'
              }, true)
            }}
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actif</option>
            <option value="false">Inactif</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => props.ctrl.resetFilters()}
      >
        Réinitialiser
      </button>
    </div>
  )
}

