import { createSignal, Show, type JSX } from "solid-js"
import { Chevron } from "../Chevron/Chevron"

interface CollapseProps {
  title: string
  children: JSX.Element
  defaultOpen?: boolean
  icon?: JSX.Element
  className?: string
}

export const Collapse = (props: CollapseProps) => {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen || false)

  const toggle = () => {
    setIsOpen(!isOpen())
  }

  return (
    <div class={`border border-gray-200 rounded-lg overflow-hidden ${props.className || ''}`}>
      {/* Header */}
      <button
        onClick={toggle}
        class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
      >
        <div class="flex items-center gap-3">
          <Show when={props.icon}>
            <div class="text-gray-600">
              {props.icon}
            </div>
          </Show>
          <span class="font-medium text-gray-900">
            {props.title}
          </span>
        </div>
        <Chevron
          direction={isOpen() ? "down" : "right"}
          size={16}
          class="text-gray-500 transition-transform duration-200"
        />
      </button>

      {/* Content */}
      <Show when={isOpen()}>
        <div class="px-4 py-4 bg-white border-t border-gray-200">
          {props.children}
        </div>
      </Show>
    </div>
  )
}
