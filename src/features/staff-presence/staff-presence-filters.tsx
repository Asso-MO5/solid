import { For } from "solid-js"
import type { StaffPresenceCtrlReturn, PresencePeriod } from "./staff-presence.types"

interface StaffPresenceFiltersProps {
  ctrl: StaffPresenceCtrlReturn
}

const PERIOD_OPTIONS: { value: PresencePeriod | ''; label: string }[] = [
  { value: '', label: 'Toutes les périodes' },
  { value: 'morning', label: 'Matin' },
  { value: 'afternoon', label: 'Après-midi' },
  { value: 'both', label: 'Journée complète' },
]

const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const StaffPresenceFilters = (props: StaffPresenceFiltersProps) => {
  const filter = () => props.ctrl.filter()

  const handlePeriodChange = (value: string) => {
    props.ctrl.setFilter(
      { period: value === '' ? undefined : (value as PresencePeriod) },
      true
    )
  }

  const handleRefusedChange = (value: string) => {
    props.ctrl.setFilter(
      { refused: value === '' ? undefined : value === 'true' },
      true
    )
  }

  const handleDateChange = async (value: string) => {
    if (value) {
      // Si une date est sélectionnée, utiliser cette date comme start_date et end_date
      props.ctrl.setFilter(
        { start_date: value, end_date: value },
        true
      )
      // Recharger les données en utilisant les filtres (ne pas passer view/selectedDate)
      await props.ctrl.getPresences()
    } else {
      // Si la date est effacée, retirer les filtres de date
      props.ctrl.setFilter(
        { start_date: undefined, end_date: undefined },
        true
      )
      // Recharger les données pour le mois actuel
      await props.ctrl.getPresences('month', new Date())
    }
  }

  // Pour le filtre par jour, utiliser start_date si start_date === end_date
  const selectedDate = () => {
    const f = filter()
    if (f.start_date && f.end_date && f.start_date === f.end_date) {
      return f.start_date
    }
    return ''
  }

  return (
    <div>
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
            Date :
          </label>
          <input
            type="date"
            value={formatDateForInput(selectedDate())}
            onInput={(e) => handleDateChange(e.currentTarget.value)}
            class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
            Période :
          </label>
          <select
            value={filter().period || ''}
            onChange={(e) => handlePeriodChange(e.currentTarget.value)}
            class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <For each={PERIOD_OPTIONS}>
              {(option) => (
                <option value={option.value}>{option.label}</option>
              )}
            </For>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 whitespace-nowrap">
            Statut :
          </label>
          <select
            value={filter().refused === undefined ? '' : filter().refused ? 'true' : 'false'}
            onChange={(e) => handleRefusedChange(e.currentTarget.value)}
            class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous</option>
            <option value="false">Accepté</option>
            <option value="true">Refusé</option>
          </select>
        </div>

        <button
          onClick={() => props.ctrl.resetFilters()}
          class="px-4 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

