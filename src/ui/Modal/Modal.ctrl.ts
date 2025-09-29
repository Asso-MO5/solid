import { createSignal, type JSX } from "solid-js"
import type { ModalState, ModalCtrlReturn } from "./Modal.types"

// Signaux globaux pour le modal
const [isOpen, setIsOpen] = createSignal<boolean>(false)
const [title, setTitle] = createSignal<string | undefined>(undefined)
const [content, setContent] = createSignal<JSX.Element>(undefined)
const [size, setSize] = createSignal<'sm' | 'md' | 'lg' | 'xl' | 'full'>('md')
const [closable, setClosable] = createSignal<boolean>(true)
const [onClose, setOnClose] = createSignal<(() => void) | undefined>(undefined)

export function ModalCtrl(): ModalCtrlReturn {

  const open = (options: Partial<ModalState> = {}) => {
    if (options.title !== undefined) setTitle(options.title)
    if (options.content !== undefined) setContent(options.content)
    if (options.size !== undefined) setSize(options.size)
    if (options.closable !== undefined) setClosable(options.closable)
    if (options.onClose !== undefined) setOnClose(() => options.onClose)

    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    const closeHandler = onClose()
    if (closeHandler) {
      closeHandler()
    }
  }


  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && closable()) {
      close()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && closable()) {
      close()
    }
  }

  const handleContentClick = (e: MouseEvent) => {
    e.stopPropagation()
  }

  return {
    // État
    isOpen,
    title,
    content,
    size,
    closable,

    // Actions
    open,
    close,
    setTitle,
    setContent,
    setSize,

    // Utilitaires
    handleBackdropClick,
    handleKeyDown,
    handleContentClick
  }
}
