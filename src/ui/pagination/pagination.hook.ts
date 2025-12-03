import { createEffect, createSignal, onCleanup } from "solid-js"

interface UsePaginationProps {
  currentPage: number
  totalPages: number
  limit?: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
}

export const usePagination = (props: UsePaginationProps) => {
  const [pageInput, setPageInput] = createSignal<string>('')
  const [limitInput, setLimitInput] = createSignal<string>('')

  let pageDebounceTimer: ReturnType<typeof setTimeout> | null = null
  let limitDebounceTimer: ReturnType<typeof setTimeout> | null = null

  // Synchroniser les inputs avec les props
  createEffect(() => {
    const currentPage = props.currentPage
    setPageInput(String(currentPage))
  })

  createEffect(() => {
    const limit = props.limit || 500
    setLimitInput(String(limit))
  })

  const handlePageChange = (page: number) => {
    const clamped = Math.min(props.totalPages, Math.max(1, page))
    props.onPageChange(clamped)
  }

  const handlePageInputChange = (value: string) => {
    setPageInput(value)

    // Annuler le timer précédent
    if (pageDebounceTimer) {
      clearTimeout(pageDebounceTimer)
    }

    pageDebounceTimer = setTimeout(() => {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue >= 1 && numValue <= props.totalPages) {
        handlePageChange(numValue)
      } else {
        // Réinitialiser si valeur invalide
        setPageInput(String(props.currentPage))
      }
    }, 500)
  }

  const handleLimitInputChange = (value: string) => {
    setLimitInput(value)

    // Annuler le timer précédent
    if (limitDebounceTimer) {
      clearTimeout(limitDebounceTimer)
    }

    limitDebounceTimer = setTimeout(() => {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue >= 1) {
        props.onLimitChange?.(numValue)
      } else {
        // Réinitialiser si valeur invalide
        setLimitInput(String(props.limit || 500))
      }
    }, 500)
  }

  const handlePageInputBlur = () => {
    // Réinitialiser si valeur invalide au blur
    const numValue = parseInt(pageInput(), 10)
    if (isNaN(numValue) || numValue < 1 || numValue > props.totalPages) {
      setPageInput(String(props.currentPage))
    }
  }

  const handleLimitInputBlur = () => {
    // Réinitialiser si valeur invalide au blur
    const numValue = parseInt(limitInput(), 10)
    if (isNaN(numValue) || numValue < 1) {
      setLimitInput(String(props.limit || 500))
    }
  }

  // Cleanup des timers
  onCleanup(() => {
    if (pageDebounceTimer) {
      clearTimeout(pageDebounceTimer)
    }
    if (limitDebounceTimer) {
      clearTimeout(limitDebounceTimer)
    }
  })

  return {
    pageInput,
    limitInput,
    handlePageChange,
    handlePageInputChange,
    handleLimitInputChange,
    handlePageInputBlur,
    handleLimitInputBlur
  }
}
