export interface MuseumPresenceDay {
  date: string
  day_name: string
  is_open: boolean
  my_presence?: {
    id: string
    period: 'afternoon'
    refused: boolean
  }
  all_presences?: Array<{
    id: string
    user_id: string
    user_name: string
    period: 'afternoon'
    refused: boolean
  }>
}

export interface MuseumPresenceCtrlReturn {
  weeks: () => MuseumPresenceDay[][]
  isLoading: () => boolean
  error: () => string | null
  togglePresence: (date: string) => Promise<void>
  toggleRefuse: (presenceId: string, refused: boolean) => Promise<void>
  refresh: () => Promise<void>
  isFetching: () => boolean
}

