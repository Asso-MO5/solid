import { createSignal, type Accessor } from "solid-js"
import type { Toast, ToastOptions } from "./Toast.types"

const [toasts, setToasts] = createSignal<Toast[]>([])

export function ToastCtrl() {
  const addToast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration || 5000,
      closable: options.closable !== false
    }

    setToasts(prev => [...prev, toast])

    // Auto-remove après la durée spécifiée
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAll = () => {
    setToasts([])
  }

  // Méthodes de convenance
  const success = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'success', title, message })
  }

  const error = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'error', title, message })
  }

  const warning = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'warning', title, message })
  }

  const info = (title: string, message?: string, options?: Partial<ToastOptions>) => {
    return addToast({ ...options, type: 'info', title, message })
  }

  return {
    toasts: toasts as Accessor<Toast[]>,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
