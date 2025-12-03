/**
 * Types pour la feature special-periods (gestion des périodes spéciales)
 */

export type SpecialPeriodType = 'holiday' | 'closure'

export interface SpecialPeriod {
  id: string
  type: SpecialPeriodType
  start_date: string // Format YYYY-MM-DD
  end_date: string // Format YYYY-MM-DD
  name: string
  description: string
  zone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SpecialPeriodsFilter {
  type?: SpecialPeriodType
  date?: string // Format YYYY-MM-DD - Vérifier si une date est dans une période spéciale
  zone?: string
  is_active?: boolean
  page: number
  limit: number
}

export interface SpecialPeriodsCtrlReturn {
  // État
  periods: () => SpecialPeriod[]
  isLoading: () => boolean
  isFetching: () => boolean
  filter: () => SpecialPeriodsFilter
  totalPages: () => number
  currentPage: () => number

  // Actions
  setFilter: (filter: Partial<SpecialPeriodsFilter>, immediate?: boolean) => void
  getPeriods: () => Promise<void>
  resetFilters: () => void
  createPeriod: (data: CreatePeriodData) => Promise<void>
  updatePeriod: (id: string, data: UpdatePeriodData) => Promise<void>
  deletePeriod: (id: string) => Promise<void>
}

export interface CreatePeriodData {
  type: SpecialPeriodType
  start_date: string
  end_date: string
  name: string
  description: string
  zone: string
  is_active: boolean
}

export interface UpdatePeriodData extends CreatePeriodData { }

