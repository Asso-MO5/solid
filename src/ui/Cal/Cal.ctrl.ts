import { createSignal, createMemo, onMount, onCleanup, createEffect } from "solid-js"
import { useLocation } from "@solidjs/router"
import type { CalendarView, CalendarDay, CalendarEvent, CalendarCtrlReturn } from "./Cal.types"

const [view, setView] = createSignal<CalendarView>('month')
const [selectedDate, setSelectedDate] = createSignal<Date>(new Date())
const [items, setItems] = createSignal<CalendarEvent[]>([])

// Fonctions pour gérer les query parameters
const getQueryParams = () => {
  if (typeof window === 'undefined') return {}
  const urlParams = new URLSearchParams(window.location.search)
  return {
    view: urlParams.get('view') as CalendarView | null,
    date: urlParams.get('date')
  }
}

const updateQueryParams = (newView: CalendarView, newDate: Date) => {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.set('view', newView)
  url.searchParams.set('date', newDate.toISOString().split('T')[0]) // Format YYYY-MM-DD

  // Mettre à jour l'URL sans recharger la page
  window.history.pushState({}, '', url.toString())
}

const initializeFromURL = () => {
  const params = getQueryParams()

  // Initialiser la vue
  if (params.view && ['month', 'week', 'day', 'list'].includes(params.view)) {
    setView(params.view as CalendarView)
  } else {
    // Si pas de vue dans l'URL, mettre à jour l'URL avec la vue par défaut
    updateQueryParams(view(), selectedDate())
  }

  // Initialiser la date
  if (params.date) {
    const date = new Date(params.date)
    if (!isNaN(date.getTime())) {
      setSelectedDate(date)
    }
  } else {
    // Si pas de date dans l'URL, mettre à jour l'URL avec la date par défaut
    updateQueryParams(view(), selectedDate())
  }
}

export function CalCtrl(): CalendarCtrlReturn {
  const location = useLocation()

  // Initialiser depuis l'URL au montage
  onMount(() => {
    initializeFromURL()

    // Écouter les changements d'URL (navigation navigateur)
    const handlePopState = () => {
      initializeFromURL()
    }

    window.addEventListener('popstate', handlePopState)

    onCleanup(() => {
      window.removeEventListener('popstate', handlePopState)
    })
  })

  // Réagir aux changements de route (navigation SolidJS Router)
  createEffect(() => {
    // Seulement si on est sur la page du calendrier
    if (location.pathname === '/admin/cal') {
      initializeFromURL()
    }
  })

  // Wrapper pour setView qui met à jour l'URL
  const setViewWithURL = (newView: CalendarView) => {
    setView(newView)
    updateQueryParams(newView, selectedDate())
  }

  // Wrapper pour setSelectedDate qui met à jour l'URL
  const setSelectedDateWithURL = (newDate: Date) => {
    setSelectedDate(newDate)
    updateQueryParams(view(), newDate)
  }

  const goToPrevious = () => {
    const current = selectedDate()
    const newDate = new Date(current)

    switch (view()) {
      case 'month':
        newDate.setMonth(current.getMonth() - 1)
        break
      case 'week':
        newDate.setDate(current.getDate() - 7)
        break
      case 'day':
        newDate.setDate(current.getDate() - 1)
        break
      case 'list':
        // Pour la vue liste, on peut naviguer par mois
        newDate.setMonth(current.getMonth() - 1)
        break
    }

    setSelectedDateWithURL(newDate)
  }

  const goToNext = () => {
    const current = selectedDate()
    const newDate = new Date(current)

    switch (view()) {
      case 'month':
        newDate.setMonth(current.getMonth() + 1)
        break
      case 'week':
        newDate.setDate(current.getDate() + 7)
        break
      case 'day':
        newDate.setDate(current.getDate() + 1)
        break
      case 'list':
        // Pour la vue liste, on peut naviguer par mois
        newDate.setMonth(current.getMonth() + 1)
        break
    }

    setSelectedDateWithURL(newDate)
  }

  const goToToday = () => {
    setSelectedDateWithURL(new Date())
  }

  const generateMonthDays = (current: Date, today: Date): CalendarDay[] => {
    const year = current.getFullYear()
    const month = current.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay() + 1)

    const days: CalendarDay[] = []

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate()),
        items: []
      })
    }

    return days
  }

  const generateWeekDays = (current: Date, today: Date): CalendarDay[] => {
    const startOfWeek = new Date(current)
    startOfWeek.setDate(current.getDate() - current.getDay() + 1) // Lundi

    const days: CalendarDay[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)

      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate()),
        items: []
      })
    }

    return days
  }

  const generateDayView = (current: Date, today: Date): CalendarDay[] => {
    return [{
      date: current,
      isCurrentMonth: true,
      isToday: isSameDay(current, today),
      isSelected: true,
      items: []
    }]
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
  }

  const getItemsForDay = (day: Date): CalendarEvent[] => {
    return items().filter((event: CalendarEvent) => {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59)

      return startDate <= dayEnd && endDate >= dayStart
    })
  }

  const getItemsForList = (): CalendarEvent[] => {
    const current = selectedDate()
    const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1)
    const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0)

    return items()
      .filter((event: CalendarEvent) => {
        const eventStartDate = new Date(event.startDate)
        return eventStartDate >= startOfMonth && eventStartDate <= endOfMonth
      })
      .sort((a, b) => {
        const dateA = new Date(a.startDate)
        const dateB = new Date(b.startDate)
        return dateA.getTime() - dateB.getTime()
      })
  }

  const formatDate = (date: Date): string => {
    return date.getDate().toString()
  }


  // Génération des jours du calendrier avec items
  const calendarDays = createMemo((): CalendarDay[] => {
    const current = selectedDate()
    const today = new Date()

    let days: CalendarDay[] = []

    if (view() === 'month') {
      days = generateMonthDays(current, today)
    } else if (view() === 'week') {
      days = generateWeekDays(current, today)
    } else {
      days = generateDayView(current, today)
    }

    // Ajouter les items à chaque jour
    return days.map(day => ({
      ...day,
      items: getItemsForDay(day.date)
    }))
  })

  // Données calculées
  const currentMonthName = createMemo(() => {
    return selectedDate().toLocaleDateString('fr-FR', {
      month: 'long'
    })
  })

  const currentYear = createMemo(() => {
    return selectedDate().getFullYear()
  })

  const weekDays = createMemo(() => {
    return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  })


  return {
    // État
    view,
    selectedDate,

    // Actions
    setView: setViewWithURL,
    setSelectedDate: setSelectedDateWithURL,
    setItems,

    // Navigation
    goToPrevious,
    goToNext,
    goToToday,

    // Données calculées
    calendarDays,
    currentMonthName,
    currentYear,
    weekDays,
    listEvents: getItemsForList,

    // Utilitaires
    formatDate
  }
}