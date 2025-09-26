import { Chip } from "./Chip"

interface TypeChipProps {
  category?: string
}

export const TypeChip = (props: TypeChipProps) => {
  const getCategoryText = (category?: string): string => {
    switch (category) {
      case 'video': return 'Vidéo'
      case 'expo': return 'Expo'
      case 'ag': return 'AG'
      case 'live': return 'Live'
      case 'meeting': return 'Réunion'
      case 'training': return 'Formation'
      case 'conference': return 'Conférence'
      case 'other': return 'Autre'
      default: return 'Non défini'
    }
  }

  return (
    <Chip type="category" variant={props.category as any}>
      {getCategoryText(props.category)}
    </Chip>
  )
}
