import type { Accessor, JSX } from "solid-js"

export interface ModalState {
  isOpen: boolean
  title?: string
  content?: JSX.Element
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  onClose?: () => void
}

export interface ModalCtrlReturn {
  // État
  isOpen: Accessor<boolean>
  title: Accessor<string | undefined>
  content: Accessor<JSX.Element>
  size: Accessor<'sm' | 'md' | 'lg' | 'xl' | 'full'>
  closable: Accessor<boolean>

  // Actions
  open: (options?: Partial<ModalState>) => void
  close: () => void
  setTitle: (title: string) => void
  setContent: (content: JSX.Element) => void
  setSize: (size: 'sm' | 'md' | 'lg' | 'xl' | 'full') => void

  // Utilitaires
  handleBackdropClick: (e: MouseEvent) => void
  handleKeyDown: (e: KeyboardEvent) => void
  handleContentClick: (e: MouseEvent) => void
}
