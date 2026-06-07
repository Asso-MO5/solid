import { Chip } from "./Chip"

interface StatusChipProps {
  status?: string
}

export const StatusChip = (props: StatusChipProps) => {
  const getStatusText = (status?: string): string => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'private': return 'Privé'
      case 'member': return 'Membres'
      case 'public': return 'Public'
      default: return 'Inconnu'
    }
  }

  return (
    <Chip type="status" variant={props.status as any}>
      {getStatusText(props.status)}
    </Chip>
  )
}
