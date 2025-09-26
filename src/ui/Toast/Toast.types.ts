export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  closable?: boolean
}

export interface ToastOptions {
  type?: ToastType
  title: string
  message?: string
  duration?: number
  closable?: boolean
}
