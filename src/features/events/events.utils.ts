// Fonction pour obtenir la couleur selon la catégorie
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'video': return '#3b82f6'
    case 'expo': return '#8b5cf6'
    case 'ag': return '#e84855'
    case 'live': return '#ef4444'
    case 'meeting': return '#4088cf'
    case 'training': return '#70cbe6'
    case 'conference': return '#ec4899'
    case 'other': return '#6b7280'
    default: return '#3b82f6'
  }
}
