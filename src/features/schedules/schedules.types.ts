/**
 * Type d'audience pour les horaires
 */
export type AudienceType = 'public' | 'member'

/**
 * Jour de la semaine (0 = dimanche, 1 = lundi, ..., 6 = samedi)
 */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Horaire du musée
 * 
 * Peut être soit un horaire récurrent (par jour de la semaine),
 * soit une exception (avec dates spécifiques)
 */
export type Schedule = {
  /** Identifiant unique (UUID) */
  id: string

  /** 
   * Jour de la semaine pour les horaires récurrents
   * 0 = dimanche, 1 = lundi, ..., 6 = samedi
   * Nullable pour les exceptions
   */
  dayOfWeek: DayOfWeek | null

  /** Heure de début (format time) */
  startTime: string

  /** Heure de fin (format time) */
  endTime: string

  /** Type d'audience (public ou membre) */
  audienceType: AudienceType

  /** 
   * Date de début pour les exceptions ou périodes spécifiques
   * Nullable pour les horaires récurrents
   */
  startDate: string | null

  /** 
   * Date de fin pour les exceptions ou périodes spécifiques
   * Nullable pour les horaires récurrents
   */
  endDate: string | null

  /** 
   * Indique si c'est une exception (horaire spécial, fermeture, etc.)
   * Si true, startDate et endDate doivent être définis
   */
  isException: boolean

  /** Indique si c'est un jour de fermeture */
  isClosed: boolean

  /** Description de l'exception ou du changement d'horaire */
  description: string | null

  /** Date de création */
  createdAt: Date

  /** Date de dernière mise à jour */
  updatedAt: Date
}

/**
 * Données pour créer un nouvel horaire
 */
export type ScheduleCreateInput = Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Données pour mettre à jour un horaire
 */
export type ScheduleUpdateInput = Partial<Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>>

/**
 * Horaire récurrent (par jour de la semaine)
 */
export type RecurrentSchedule = Schedule & {
  dayOfWeek: DayOfWeek
  isException: false
  startDate: null
  endDate: null
}

/**
 * Exception d'horaire (avec dates spécifiques)
 */
export type ScheduleException = Schedule & {
  isException: true
  startDate: string
  endDate: string
  dayOfWeek: null
}