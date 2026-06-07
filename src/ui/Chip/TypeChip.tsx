import { Chip } from "./Chip"

interface TypeChipProps {
  category?: string
}

export const TypeChip = (props: TypeChipProps) => {
  const getCategoryText = (category?: string): string => {
    switch (category) {
      case 'live': return 'Live'
      case 'mediation': return 'Médiation'
      case 'workshop': return 'Atelier'
      case 'conference': return 'Conférence'
      case 'exhibition': return 'Exposition'
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
