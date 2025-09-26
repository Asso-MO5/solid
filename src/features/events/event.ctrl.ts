import { createSignal, createEffect, type Accessor } from "solid-js"
import { useToast } from "~/ui/Toast"

interface Event {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  category: string
  status: string
  allowedRoles: string[]
  isConfidential: boolean
  color: string
  [key: string]: unknown
}

export function useEventCtrl(eventId: string) {
  const [event, setEvent] = createSignal<Event | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [error, setError] = createSignal<string | null>(null)
  const toast = useToast()

  const fetchEvent = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError('Événement non trouvé')
        } else if (response.status === 403) {
          setError('Accès refusé - Vous n\'avez pas les permissions pour voir cet événement')
        } else if (response.status === 401) {
          setError('Non authentifié - Veuillez vous connecter')
        } else {
          setError('Erreur lors du chargement de l\'événement')
        }
        return
      }

      const eventData = await response.json()
      setEvent(eventData)

    } catch (err) {
      console.error('Error fetching event:', err)
      setError('Erreur de connexion')
      toast.error('Erreur', 'Impossible de charger l\'événement')
    } finally {
      setLoading(false)
    }
  }

  // Charger l'événement au montage du composant
  createEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  })

  return {
    event: event as Accessor<Event | null>,
    loading: loading as Accessor<boolean>,
    error: error as Accessor<string | null>,
    refetch: fetchEvent
  }
}