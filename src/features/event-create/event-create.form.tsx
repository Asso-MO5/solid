import { createSignal, createEffect, Show, For } from "solid-js"
import { EVENT_CATEGORIES, EVENT_STATUSES, AVAILABLE_ROLES } from "../events/events.const"
import type { EventCreateFormData } from "./event-create.types"

/**
 * Formulaire de création d'événement
 * Composant UI pur sans logique métier
 */

interface EventCreateFormProps {
  selectedDate?: Date | null
  currentView?: 'month' | 'week' | 'day' | 'list'
  loading: boolean
  onSubmit: (data: EventCreateFormData) => void
  onCancel: () => void
}

export const EventCreateForm = (props: EventCreateFormProps) => {
  const [formData, setFormData] = createSignal<EventCreateFormData>({
    title: '',
    description: '',
    category: 'other',
    status: 'draft',
    startDate: '',
    endDate: '',
    allowedRoles: [],
    isConfidential: false
  })

  // Pré-remplir les dates selon la vue
  createEffect(() => {
    if (props.selectedDate) {
      const useTime = props.currentView === 'day' || props.currentView === 'week'
      const startDate = formatDateForInput(props.selectedDate, useTime)
      const endDate = useTime
        ? formatDateForInput(new Date(props.selectedDate.getTime() + 60 * 60 * 1000), true)
        : formatDateForInput(props.selectedDate, false).replace('09:00', '10:00')

      setFormData(prev => ({
        ...prev,
        startDate,
        endDate
      }))
    }
  })

  const formatDateForInput = (date: Date, useTime: boolean): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    if (useTime) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } else {
      return `${year}-${month}-${day}T09:00`
    }
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    props.onSubmit(formData())
  }

  const updateField = (field: keyof EventCreateFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="title" class="block text-sm font-medium mb-2">
            Titre *
          </label>
          <input
            id="title"
            type="text"
            required
            value={formData().title}
            onInput={(e) => updateField('title', e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="category" class="block text-sm font-medium mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            required
            value={formData().category}
            onChange={(e) => updateField('category', e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <For each={EVENT_CATEGORIES}>
              {(category) => (
                <option value={category.value}>{category.label}</option>
              )}
            </For>
          </select>
        </div>
      </div>

      <div>
        <label for="description" class="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData().description}
          onInput={(e) => updateField('description', e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="startDate" class="block text-sm font-medium mb-2">
            Date de début *
          </label>
          <input
            id="startDate"
            type="datetime-local"
            required
            value={formData().startDate}
            onInput={(e) => updateField('startDate', e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label for="endDate" class="block text-sm font-medium mb-2">
            Date de fin *
          </label>
          <input
            id="endDate"
            type="datetime-local"
            required
            value={formData().endDate}
            onInput={(e) => updateField('endDate', e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="status" class="block text-sm font-medium mb-2">
            Statut
          </label>
          <select
            id="status"
            value={formData().status}
            onChange={(e) => updateField('status', e.currentTarget.value)}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <For each={EVENT_STATUSES}>
              {(status) => (
                <option value={status.value}>{status.label}</option>
              )}
            </For>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">
            Rôles autorisés
          </label>
          <div class="space-y-2">
            <For each={AVAILABLE_ROLES}>
              {(role) => (
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData().allowedRoles.includes(role.value)}
                    onChange={(e) => {
                      const currentRoles = formData().allowedRoles
                      const newRoles = e.currentTarget.checked
                        ? [...currentRoles, role.value]
                        : currentRoles.filter(r => r !== role.value)
                      updateField('allowedRoles', newRoles)
                    }}
                    class="mr-2"
                  />
                  {role.label}
                </label>
              )}
            </For>
          </div>
        </div>
      </div>

      <div>
        <label class="flex items-center">
          <input
            type="checkbox"
            checked={formData().isConfidential}
            onChange={(e) => updateField('isConfidential', e.currentTarget.checked)}
            class="mr-2"
          />
          Événement confidentiel
        </label>
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          onClick={props.onCancel}
          class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={props.loading}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Show when={props.loading} fallback="Créer l'événement">
            Création...
          </Show>
        </button>
      </div>
    </form>
  )
}
