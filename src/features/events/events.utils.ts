// Fonction pour obtenir la couleur selon la catégorie
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'live': return '#ef4444'
    case 'mediation': return '#3b82f6'
    case 'workshop': return '#70cbe6'
    case 'conference': return '#ec4899'
    case 'exhibition': return '#8b5cf6'
    case 'other': return '#6b7280'
    default: return '#3b82f6'
  }
}
