import { createSignal, Show } from "solid-js"
import type { CreatePeriodData, UpdatePeriodData, SpecialPeriod } from "./special-periods.types"

interface SpecialPeriodsFormModalProps {
  period?: SpecialPeriod
  onSave: (data: CreatePeriodData | UpdatePeriodData) => Promise<void>
  onCancel: () => void
}

// Fonction pour convertir une date ISO en format YYYY-MM-DD pour les inputs date
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

export const SpecialPeriodsFormModal = (props: SpecialPeriodsFormModalProps) => {
  // eslint-disable-next-line solid/reactivity
  const period = props.period

  const [type, setType] = createSignal<CreatePeriodData['type']>(period?.type || 'holiday')
  const [startDate, setStartDate] = createSignal<string>(formatDateForInput(period?.start_date))
  const [endDate, setEndDate] = createSignal<string>(formatDateForInput(period?.end_date))
  const [name, setName] = createSignal<string>(period?.name || '')
  const [description, setDescription] = createSignal<string>(period?.description || '')
  const [zone, setZone] = createSignal<string>(period?.zone || '')
  const [isActive, setIsActive] = createSignal<boolean>(period?.is_active ?? true)
  const [isSubmitting, setIsSubmitting] = createSignal<boolean>(false)
  const [errors, setErrors] = createSignal<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name().trim()) {
      newErrors.name = "Le nom est requis."
    }

    if (!startDate()) {
      newErrors.startDate = "La date de début est requise."
    }

    if (!endDate()) {
      newErrors.endDate = "La date de fin est requise."
    }

    if (startDate() && endDate() && new Date(startDate()) > new Date(endDate())) {
      newErrors.endDate = "La date de fin doit être postérieure à la date de début."
    }


    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      await props.onSave({
        type: type(),
        start_date: startDate(),
        end_date: endDate(),
        name: name().trim(),
        description: description().trim(),
        zone: zone().trim(),
        is_active: isActive()
      })
    } catch (error) {
      // L'erreur est déjà gérée dans le contrôleur
    } finally {
      setIsSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      {/* Type */}
      <div class="flex flex-col gap-1">
        <label for="type" class="text-sm font-medium text-gray-700">
          Type <span class="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={type()}
          onChange={(e) => setType(e.currentTarget.value as CreatePeriodData['type'])}
          required
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="holiday">Vacances</option>
          <option value="closure">Fermeture</option>
        </select>
      </div>

      {/* Nom */}
      <div class="flex flex-col gap-1">
        <label for="name" class="text-sm font-medium text-gray-700">
          Nom <span class="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
          required
          placeholder="Nom de la période spéciale"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Show when={errors().name}>
          <p class="text-red-500 text-xs">{errors().name}</p>
        </Show>
      </div>

      {/* Description */}
      <div class="flex flex-col gap-1">
        <label for="description" class="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          rows={3}
          placeholder="Description de la période spéciale"
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Date début */}
      <div class="flex flex-col gap-1">
        <label for="startDate" class="text-sm font-medium text-gray-700">
          Date de début <span class="text-red-500">*</span>
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate()}
          onInput={(e) => setStartDate(e.currentTarget.value)}
          required
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Show when={errors().startDate}>
          <p class="text-red-500 text-xs">{errors().startDate}</p>
        </Show>
      </div>

      {/* Date fin */}
      <div class="flex flex-col gap-1">
        <label for="endDate" class="text-sm font-medium text-gray-700">
          Date de fin <span class="text-red-500">*</span>
        </label>
        <input
          id="endDate"
          type="date"
          min={startDate() || today}
          value={endDate()}
          onInput={(e) => setEndDate(e.currentTarget.value)}
          required
          class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Show when={errors().endDate}>
          <p class="text-red-500 text-xs">{errors().endDate}</p>
        </Show>
      </div>

      {/* Zone (uniquement pour les vacances) */}
      <Show when={type() === 'holiday'}>
        <div class="flex flex-col gap-1">
          <label for="zone" class="text-sm font-medium text-gray-700">
            Zone
          </label>
          <input
            id="zone"
            type="text"
            value={zone()}
            onInput={(e) => setZone(e.currentTarget.value)}
            placeholder="Zone (ex: A, B, C)"
            class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Show when={errors().zone}>
            <p class="text-red-500 text-xs">{errors().zone}</p>
          </Show>
        </div>
      </Show>

      {/* Statut actif */}
      <div class="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={isActive()}
          onChange={(e) => setIsActive(e.currentTarget.checked)}
          class="w-4 h-4"
        />
        <label for="isActive" class="text-sm font-medium text-gray-700">
          Période active
        </label>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={() => props.onCancel()}
          disabled={isSubmitting()}
          class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting()}
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
        >
          <Show when={isSubmitting()} fallback={props.period ? "Enregistrer" : "Créer"}>
            {props.period ? "Enregistrement..." : "Création..."}
          </Show>
        </button>
      </div>
    </form>
  )
}

