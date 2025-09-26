import { createSignal, For, createEffect } from "solid-js"
import type { CalendarEvent } from "~/ui/Cal/Cal.types"
import type { EventCreateData } from "./events.ctrl"
import { EVENT_CATEGORIES, EVENT_STATUSES, AVAILABLE_ROLES } from "./events.const"
import { EventCreateCtrl } from "./EventCreate.ctrl"
import { toast } from "~/ui/Toast"
import { useCan } from "../auth/can.ctrl"

interface EventCreateFormProps {
  onEventCreated?: (event: CalendarEvent) => void
  onClose: () => void
  selectedDate?: Date | null
  currentView?: 'month' | 'week' | 'day' | 'list'
}

export const EventCreateForm = (props: EventCreateFormProps) => {

  const eventCreate = EventCreateCtrl()

  // Vérification des permissions
  const canCreateEvent = useCan({ admin: true, video: true })
  const canAdmin = useCan({ admin: true })
  const canVideo = useCan({ video: true })

  // Fonction pour formater une date pour l'input datetime-local
  function formatDateForInput(date: Date, useTime: boolean = false): string {
    // Utiliser les méthodes locales pour éviter les problèmes de fuseau horaire
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    if (useTime) {
      // Utiliser l'heure exacte du clic (mode jour/semaine)
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    } else {
      // Heures par défaut (mode mois)
      return `${year}-${month}-${day}T09:00`
    }
  }

  const [formData, setFormData] = createSignal<EventCreateData>({
    title: '',
    description: '',
    category: 'other',
    status: 'draft',
    startDate: '',
    endDate: '',
    allowedRoles: [],
    isConfidential: false
  })

  // Mettre à jour les dates quand selectedDate change
  createEffect(() => {
    if (props.selectedDate) {
      const useTime = props.currentView === 'day' || props.currentView === 'week'
      const startDate = formatDateForInput(props.selectedDate, useTime)

      // Pour la date de fin, ajouter 1 heure si on utilise l'heure exacte, sinon 10h
      let endDate: string
      if (useTime) {
        // Créer une nouvelle date locale pour éviter les problèmes de fuseau horaire
        const endDateTime = new Date(props.selectedDate.getTime() + 60 * 60 * 1000) // +1h en millisecondes
        endDate = formatDateForInput(endDateTime, true)
      } else {
        endDate = formatDateForInput(props.selectedDate, false).replace('T09:00', 'T10:00')
      }

      setFormData(prev => ({
        ...prev,
        startDate,
        endDate
      }))
    }
  })



  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    if (!canCreateEvent()) {
      toast.error('Erreur', 'Vous n\'avez pas les permissions pour créer un événement.')
      return
    }

    const resetForm = () => {

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'other',
        status: 'draft',
        startDate: '',
        endDate: '',
        allowedRoles: [],
        isConfidential: false
      })
      props.onClose()
    }

    await eventCreate.handleSubmit(
      formData(),
      props.onEventCreated,
    )

    resetForm()
  }

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-4">
      {/* Titre */}
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Titre *
        </label>
        <input
          type="text"
          id="title"
          value={formData().title}
          onInput={(e) => setFormData(prev => ({ ...prev, title: e.currentTarget.value }))}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          disabled={eventCreate.loading()}
        />
      </div>

      {/* Description */}
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData().description}
          onInput={(e) => setFormData(prev => ({ ...prev, description: e.currentTarget.value }))}
          rows={3}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={eventCreate.loading()}
        />
      </div>

      <div class="flex flex-wrap gap-4 justify-between">
        {/* Catégorie */}
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            id="category"
            value={formData().category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.currentTarget.value as EventCreateData['category'] }))}
            class="min-w-[120px]"
            required
            disabled={eventCreate.loading()}
          >
            <For each={EVENT_CATEGORIES.filter(category => {
              // Les admins voient toutes les catégories
              if (canAdmin()) {
                return true
              }

              // Les utilisateurs avec le rôle video voient uniquement les catégories video, live et other
              if (canVideo()) {
                return category.value.match(/video|live|other/i)
              }

              return false
            })}>
              {(category) => (
                <option value={category.value}>{category.label}</option>
              )}
            </For>
          </select>
        </div>

        {/* Statut */}
        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            id="status"
            value={formData().status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.currentTarget.value as EventCreateData['status'] }))}
            class="min-w-[120px]"
            disabled={eventCreate.loading()}
          >
            <For each={EVENT_STATUSES}>
              {(status) => (
                <option value={status.value}>{status.label}</option>
              )}
            </For>
          </select>
        </div>
      </div>

      {/* Dates */}
      <div class="flex flex-wrap gap-4 justify-between">
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
            Date de début *
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={formData().startDate}
            onInput={(e) => setFormData(prev => ({ ...prev, startDate: e.currentTarget.value }))}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            disabled={eventCreate.loading()}
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-2">
            Date de fin *
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={formData().endDate}
            onInput={(e) => setFormData(prev => ({ ...prev, endDate: e.currentTarget.value }))}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            disabled={eventCreate.loading()}
          />
        </div>
      </div>

      {/* Rôles autorisés */}
      <div class="flex flex-col gap-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Rôles autorisés
        </label>
        <div class="flex flex-col gap-2">
          <For each={AVAILABLE_ROLES}>
            {(role) => (
              <div class="flex items-center gap-2">
                <input
                  id={role.value}
                  type="checkbox"
                  checked={formData().allowedRoles?.includes(role.value) || false}
                  onChange={(e) => {
                    const roles = formData().allowedRoles || []
                    if (e.currentTarget.checked) {
                      setFormData(prev => ({ ...prev, allowedRoles: [...roles, role.value] }))
                    } else {
                      setFormData(prev => ({ ...prev, allowedRoles: roles.filter(r => r !== role.value) }))
                    }
                  }}
                  class="min-w-0"
                  disabled={eventCreate.loading()}
                />
                <label for={role.value} class="cursor-pointer">{role.label}</label>
              </div>
            )}
          </For>
        </div>
        <p class="text-sm text-gray-500 mt-1">
          Laissez vide pour un événement public
        </p>
      </div>

      {/* Confidentiel */}
      <div class="flex flex-col gap-2">
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData().isConfidential}
            onChange={(e) => setFormData(prev => ({ ...prev, isConfidential: e.currentTarget.checked }))}
            class="min-w-0"
            disabled={eventCreate.loading()}
          />
          <span class="text-sm font-medium text-gray-700">Événement confidentiel</span>
        </label>
        <p class="text-sm text-gray-500 mt-1">
          Visible uniquement par les administrateurs
        </p>
      </div>

      {/* Actions */}
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => props.onClose()}
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={eventCreate.loading()}
        >
          Annuler
        </button>
        <button
          type="submit"
          class="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          disabled={eventCreate.loading()}
        >
          {eventCreate.loading() ? 'Création...' : 'Créer l\'événement'}
        </button>
      </div>
    </form>
  )
}
