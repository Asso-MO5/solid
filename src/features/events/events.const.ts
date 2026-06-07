// Catégories d'événements (valeurs acceptées par ocelot)
export const EVENT_CATEGORIES = [
  { value: 'live', label: 'Live' },
  { value: 'mediation', label: 'Médiation' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'conference', label: 'Conférence' },
  { value: 'exhibition', label: 'Exposition' },
  { value: 'other', label: 'Autre' }
] as const

// Statuts d'événements (visibilité, valeurs acceptées par ocelot)
export const EVENT_STATUSES = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'private', label: 'Privé' },
  { value: 'member', label: 'Membres uniquement' },
  { value: 'public', label: 'Public' }
] as const

// Rôles disponibles
export const AVAILABLE_ROLES = [
  { value: 'bureau', label: 'Bureau' },
  { value: 'member', label: 'Membre' },
  { value: 'pole_video', label: 'Pôle Vidéo' },
  { value: 'pole_live', label: 'Pôle Live' },
  { value: 'pole_tech', label: 'Pôle Tech' },
  { value: 'pole_comm', label: 'Pôle Communication' }
] as const

// Types pour TypeScript
export type EventCategory = typeof EVENT_CATEGORIES[number]['value']
export type EventStatus = typeof EVENT_STATUSES[number]['value']
export type AvailableRole = typeof AVAILABLE_ROLES[number]['value']

// Fonction utilitaire pour obtenir le label d'une catégorie
export const getCategoryLabel = (category: EventCategory): string => {
  return EVENT_CATEGORIES.find(c => c.value === category)?.label || 'Inconnu'
}

// Fonction utilitaire pour obtenir le label d'un statut
export const getStatusLabel = (status: EventStatus): string => {
  return EVENT_STATUSES.find(s => s.value === status)?.label || 'Inconnu'
}

// Fonction utilitaire pour obtenir le label d'un rôle
export const getRoleLabel = (role: AvailableRole): string => {
  return AVAILABLE_ROLES.find(r => r.value === role)?.label || 'Inconnu'
}

// Fonction utilitaire pour obtenir le label d'un rôle (version safe)
export const getRoleLabelSafe = (role: string): string => {
  return AVAILABLE_ROLES.find(r => r.value === role)?.label || role
}

// Fonctions utilitaires safe pour les types externes
export const getCategoryLabelSafe = (category: string): string => {
  return EVENT_CATEGORIES.find(c => c.value === category)?.label || category
}

export const getStatusLabelSafe = (status: string): string => {
  return EVENT_STATUSES.find(s => s.value === status)?.label || status
}
