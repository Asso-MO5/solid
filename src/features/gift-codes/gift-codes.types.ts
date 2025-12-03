/**
 * Types pour la feature gift-codes (gestion des codes cadeaux)
 */

export type GiftCodeStatus = 'unused' | 'used' | 'expired'

export interface GiftCode {
  id: string
  code: string
  status: GiftCodeStatus
  ticket_id?: string
  pack_id: string
  recipient_email?: string
  expires_at?: string
  used_at?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface GiftCodePack {
  pack_id: string
  codes: GiftCode[]
  codes_count: number
  unused_count: number
  used_count: number
  expired_count: number
  created_at: string
}

export interface GiftCodesFilter {
  code?: string // Recherche par code (format: ^[A-Z0-9]{12}$)
  page: number
  limit: number
}

export interface GiftCodesCtrlReturn {
  // État
  packs: () => GiftCodePack[]
  isLoading: () => boolean
  isFetching: () => boolean
  filter: () => GiftCodesFilter
  totalPages: () => number
  currentPage: () => number

  // Actions
  setFilter: (filter: Partial<GiftCodesFilter>, immediate?: boolean) => void
  getPacks: () => Promise<void>
  resetFilters: () => void
  createPack: (data: CreatePackData) => Promise<void>
  distributePack: (packId: string, data: DistributePackData) => Promise<void>
  copyUnusedCodes: (pack: GiftCodePack) => void
}

export interface CreatePackData {
  quantity: number
  expires_at?: string
  notes?: string
}

export interface DistributePackData {
  code_ids: string[]
  recipient_email: string
  subject: string
  message: string
  language: string
}

