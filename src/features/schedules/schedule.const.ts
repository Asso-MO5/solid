import { DayOfWeek, DaySchedule } from "./schedules.types"

export const days = [
  {
    id: 1,
    label: 'Lundi',
  },
  {
    id: 2,
    label: 'Mardi',
  },
  {
    id: 3,
    label: 'Mercredi',
  },
  {
    id: 4,
    label: 'Jeudi',
  },
  {
    id: 5,
    label: 'Vendredi',
  },
  {
    id: 6,
    label: 'Samedi',
  },
  {
    id: 0,
    label: 'Dimanche',
  },
]

export const DEFAULT_SCHEDULES: Record<DayOfWeek, DaySchedule> = {
  0: { id: '', dayOfWeek: 0, startTime: '', endTime: '' },
  1: { id: '', dayOfWeek: 1, startTime: '', endTime: '' },
  2: { id: '', dayOfWeek: 2, startTime: '', endTime: '' },
  3: { id: '', dayOfWeek: 3, startTime: '', endTime: '' },
  4: { id: '', dayOfWeek: 4, startTime: '', endTime: '' },
  5: { id: '', dayOfWeek: 5, startTime: '', endTime: '' },
  6: { id: '', dayOfWeek: 6, startTime: '', endTime: '' },
}