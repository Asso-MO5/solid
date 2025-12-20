import { For, Show, createSignal } from "solid-js"
import type { CreatePresenceData, UpdatePresenceData, PresencePeriod, StaffPresence } from "./staff-presence.types"

interface StaffPresenceFormModalProps {
  presence?: StaffPresence
  selectedDate?: Date
  onCreate?: (data: CreatePresenceData) => Promise<void>
  onUpdate?: (id: string, data: UpdatePresenceData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onCancel: () => void
}

const PERIOD_OPTIONS: { value: PresencePeriod; label: string }[] = [
  { value: 'morning', label: 'Matin' },
  { value: 'afternoon', label: 'Après-midi' },
  { value: 'both', label: 'Journée complète' },
]

const formatDateForInput = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const StaffPresenceFormModal = (props: StaffPresenceFormModalProps) => {
  const isEditing = () => !!props.presence

  // Initialiser avec la date sélectionnée ou la date de la présence
  const initialDate = () => {
    if (props.presence) {
      return formatDateForInput(props.presence.date)
    }
    if (props.selectedDate) {
      return formatDateForInput(props.selectedDate)
    }
    return formatDateForInput(new Date())
  }

  const [date, setDate] = createSignal<string>(initialDate())
  const [period, setPeriod] = createSignal<PresencePeriod>(
    props.presence?.period || 'both'
  )
  const [isSubmitting, setIsSubmitting] = createSignal(false)
  const [isDeleting, setIsDeleting] = createSignal(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    if (isSubmitting()) return

    setIsSubmitting(true)
    try {
      if (isEditing() && props.presence) {
        await props.onUpdate?.(props.presence.id, {
          period: period(),
        })
      } else {
        await props.onCreate?.({
          date: date(),
          period: period(),
        })
      }
      props.onCancel()
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!isEditing() || !props.presence || !props.onDelete) return
    if (isDeleting()) return

    setIsDeleting(true)
    try {
      await props.onDelete(props.presence.id)
      props.onCancel()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} class="flex flex-col items-stretch min-h-full gap-6">
      <div class="flex gap-4 flex-wrap justify-between">
        <Show when={!isEditing()}>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-700" for="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date()}
              onInput={(e) => setDate(e.currentTarget.value)}
              required
            />
          </div>
        </Show>
        <div class="flex flex-col flex-1 gap-2">
          <label class="text-sm font-medium text-gray-700" for="period">
            Période
          </label>
          <select
            id="period"
            value={period()}
            onChange={(e) => setPeriod(e.currentTarget.value as PresencePeriod)}
            required
          >
            <For each={PERIOD_OPTIONS}>
              {(option) => (
                <option value={option.value}>{option.label}</option>
              )}
            </For>
          </select>
        </div>
      </div>

      <div class="flex justify-between items-center">
        {isEditing() && props.onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting() || isSubmitting()}
            class="secondary"
          >
            {isDeleting() ? 'Suppression...' : 'Supprimer'}
          </button>
        )}
        <div class="flex justify-end gap-2 ml-auto">
          <button
            type="button"
            onClick={() => props.onCancel()}
            disabled={isSubmitting() || isDeleting()}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting() || isDeleting()}
          >
            {isSubmitting() ? 'Enregistrement...' : isEditing() ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </div>
    </form >
  )
}

