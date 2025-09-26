import { Show } from "solid-js"
import type { Toast as ToastType } from "./Toast.types"
import { Close } from "../Close/Close"

interface ToastProps {
  toast: ToastType
  onClose: (id: string) => void
}

export const Toast = (props: ToastProps) => {


  return (
    <div
      class="w-80 border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out transform
             data-[type=success]:bg-green-50 data-[type=success]:border-green-200 data-[type=success]:text-green-800
             data-[type=error]:bg-red-50 data-[type=error]:border-red-200 data-[type=error]:text-red-800
             data-[type=warning]:bg-yellow-50 data-[type=warning]:border-yellow-200 data-[type=warning]:text-yellow-800
             data-[type=info]:bg-blue-50 data-[type=info]:border-info data-[type=info]:text-info"
      data-type={props.toast.type}
      role="alert"
    >
      <div class="flex items-start">
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold m-0">
              {props.toast.title}
            </h3>
            <Show when={props.toast.closable}>
              <div class=" flex-shrink-0">
                <button
                  onClick={() => props.onClose(props.toast.id)}
                  class="headless data-[type=success]:bg-green-50 data-[type=success]:border-green-200 data-[type=success]:text-green-800
             data-[type=error]:bg-red-50 data-[type=error]:border-red-200 data-[type=error]:text-red-800
             data-[type=warning]:bg-yellow-50 data-[type=warning]:border-yellow-200 data-[type=warning]:text-yellow-800
             data-[type=info]:bg-blue-50 data-[type=info]:border-blue-200 data-[type=info]:text-blue-800"
                  data-type={props.toast.type}
                  title="Fermer"
                >
                  <Close size={16} />
                </button>
              </div>
            </Show>
          </div>
          <Show when={props.toast.message}>
            <p class="mt-1 text-sm opacity-90">
              {props.toast.message}
            </p>
          </Show>
        </div>
      </div>
    </div>
  )
}
