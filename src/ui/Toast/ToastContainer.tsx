import { For, createMemo } from "solid-js"
import { Toast } from "./Toast"
import { ToastCtrl } from "./Toast.ctrl"

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}

export const ToastContainer = (props: ToastContainerProps) => {
  const toast = ToastCtrl()

  const position = createMemo(() => props.position || 'top-right')
  const maxToasts = createMemo(() => props.maxToasts || 5)

  const visibleToasts = () => {
    const allToasts = toast.toasts()
    return allToasts.slice(-maxToasts())
  }

  return (
    <div
      class="fixed z-50 pointer-events-none
            data-[position=top-left]:top-4 data-[position=top-left]:left-4
            data-[position=top-center]:top-4 data-[position=top-center]:left-1/2 data-[position=top-center]:-translate-x-1/2
            data-[position=top-right]:top-4 data-[position=top-right]:right-4
            data-[position=bottom-left]:bottom-4 data-[position=bottom-left]:left-4
            data-[position=bottom-center]:bottom-4 data-[position=bottom-center]:left-1/2 data-[position=bottom-center]:-translate-x-1/2
            data-[position=bottom-right]:bottom-4 data-[position=bottom-right]:right-4"
      data-position={position()}
      aria-live="polite"
      aria-label="Notifications"
    >
      <For each={visibleToasts()}>
        {(toastItem, index) => (
          <div
            class="pointer-events-auto mb-2 last:mb-0 transition-all duration-300 ease-in-out"
            style={{
              'transform': `translateY(${index() * 8}px)`,
              'transition-delay': `${index() * 50}ms`
            }}
          >
            <Toast
              toast={toastItem}
              onClose={toast.removeToast}
            />
          </div>
        )}
      </For>
    </div>
  )
}
