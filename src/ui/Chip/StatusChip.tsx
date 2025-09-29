import { Chip } from "./Chip"

interface StatusChipProps {
  status?: string
}

export const StatusChip = (props: StatusChipProps) => {
  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'published': return 'Publié'
      case 'cancelled': return 'Annulé'
      case 'completed': return 'Terminé'
      default: return 'Inconnu'
    }
  }

  return (
    <Chip type="status" variant={props.status as any}>
      {getStatusText(props.status)}
    </Chip>
  )
}
