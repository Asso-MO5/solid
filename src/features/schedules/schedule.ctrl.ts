import { createEffect, createSignal } from "solid-js"
import { clientEnv } from "~/env/client"
import { toast } from "~/ui/Toast"
import type {
  AudienceType,
  DayOfWeek,
  DaySchedule,
  ScheduleAPIResponse,
  ScheduleCtrlReturn
} from "./schedules.types"
import { DEFAULT_SCHEDULES } from "./schedule.const"

export const useSchedule = (audienceType: () => AudienceType): ScheduleCtrlReturn => {


  const [isLoading, setIsLoading] = createSignal<boolean>(false)
  const [editingDay, setEditingDay] = createSignal<DayOfWeek | null>(null)

  const [schedules, setSchedules] = createSignal<Record<DayOfWeek, DaySchedule>>(DEFAULT_SCHEDULES)

  const [editValues, setEditValues] = createSignal<{ startTime: string; endTime: string }>({
    startTime: '',
    endTime: ''
  })


  const formatTimeForAPI = (time: string): string => {
    if (!time) return ''
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time
    }
    if (time.match(/^\d{2}:\d{2}$/)) {
      return `${time}:00`
    }
    return time
  }

  const formatTimeForInput = (time: string): string => {
    if (!time) return ''
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time.substring(0, 5)
    }
    return time
  }

  const getSchedules = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/schedules?audience_type=${audienceType()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des horaires')
      }

      const data = await response.json()
      const newSchedules: Record<DayOfWeek, DaySchedule> = { ...DEFAULT_SCHEDULES }

      if (Array.isArray(data)) {
        (data as ScheduleAPIResponse[])
          .filter((item) =>
            item.audience_type === audienceType() &&
            item.day_of_week !== null &&
            !item.is_exception
          )
          .forEach((item) => {
            const dayOfWeek = item.day_of_week as DayOfWeek
            if (dayOfWeek !== null && dayOfWeek !== undefined) {
              newSchedules[dayOfWeek] = {
                dayOfWeek,
                startTime: formatTimeForInput(item.start_time || ''),
                endTime: formatTimeForInput(item.end_time || ''),
                id: item.id || ''
              }
            }
          })
      }

      setSchedules(newSchedules)
    } catch (error) {
      console.error(error)
      toast.error('Erreur', 'Impossible de charger les horaires.')
    }
    finally {
      setIsLoading(false)
    }
  }

  const startEdit = (dayOfWeek: DayOfWeek) => {
    const schedule = schedules()[dayOfWeek]
    setEditValues({
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || ''
    })
    setEditingDay(dayOfWeek)
  }

  const cancelEdit = () => {
    setEditingDay(null)
    setEditValues({ startTime: '', endTime: '' })
  }

  const updateEditValue = (field: 'startTime' | 'endTime', value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = async (dayOfWeek: DayOfWeek) => {
    const formattedStartTime = formatTimeForAPI(editValues().startTime)
    const formattedEndTime = formatTimeForAPI(editValues().endTime)

    setSchedules(prev => ({
      ...prev,
      [dayOfWeek]: {
        dayOfWeek,
        startTime: editValues().startTime,
        endTime: editValues().endTime
      }
    }))

    setEditingDay(null)

    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/schedules`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          audience_type: audienceType()
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde')
      }

      toast.success('Succès', 'Horaire sauvegardé avec succès.')
    } catch (error) {
      toast.error('Erreur', 'Impossible de sauvegarder l\'horaire.')
      console.error(error)
    }
  }

  const deleteSchedule = async (dayOfWeek: DayOfWeek) => {

    setIsLoading(true)
    const id = schedules()[dayOfWeek].id
    if (!id) {
      toast.error('Erreur', 'Impossible de supprimer l\'horaire.')
      return
    }

    try {
      await fetch(`${clientEnv.VITE_OCELOT_URL}/museum/schedules/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      setSchedules(prev => ({
        ...prev,
        [dayOfWeek]: {
          dayOfWeek,
          startTime: '',
          endTime: ''
        }
      }))
    }
    catch (error) {
      toast.error('Erreur', 'Impossible de supprimer l\'horaire.')
      console.error(error)
    }
    finally {
      setIsLoading(false)
    }
  }


  createEffect(() => {
    void audienceType()
    getSchedules()
  })


  return {
    isLoading,
    schedules,
    editingDay,
    editValues,
    startEdit,
    cancelEdit,
    saveEdit,
    updateEditValue,
    getSchedules,
    deleteSchedule
  }
}
