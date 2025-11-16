import type { AudienceType } from "~/features/schedules/schedules.types"

export type Price = {
  id: string
  amount: number
  audience_type: AudienceType
  start_date: string
  end_date: string
  is_active: boolean
  requires_proof: boolean
  translations?: {
    fr?: {
      name: string
      description: string
    }
    en?: {
      name: string
      description: string
    }
  }
}