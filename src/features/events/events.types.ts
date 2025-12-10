// Types pour la réponse de l'API /museum/calendar

export interface CalendarOpeningHour {
  start_time: string
  end_time: string
  audience_type: string
  description: string
}

export interface CalendarEventApi {
  id: string
  type: string
  category: string
  status: string
  start_date: string
  end_date: string
  paid_tickets_count: number
  start_time: string
  end_time: string
  location_type: string
  location_name: string
  location_address: string
  location_city: string
  location_postal_code: string
  public_title_fr: string
  public_title_en: string
  public_description_fr: string
  public_description_en: string
  public_image_url: string
  private_notes: string
  private_contact: string
  manager_dev: boolean
  manager_bureau: boolean
  manager_museum: boolean
  manager_com: boolean
  capacity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CalendarHolidayPeriod {
  id: string
  name: string
  start_date: string
  end_date: string
  zone: string
}

export interface CalendarClosurePeriod {
  id: string
  name: string
  start_date: string
  end_date: string
  zone: string
}

export interface CalendarDayApi {
  date: string
  is_open: boolean
  opening_hours: CalendarOpeningHour[]
  events: CalendarEventApi[]
  holiday_periods: CalendarHolidayPeriod[]
  closure_periods: CalendarClosurePeriod[]
  paid_tickets_count: number
}

export interface CalendarResponse {
  days: CalendarDayApi[]
  start_date: string
  end_date: string
  view: string
}
