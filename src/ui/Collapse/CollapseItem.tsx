import { createSignal, Show, type JSX } from "solid-js"
import { Chevron } from "../Chevron/Chevron"

interface CollapseItemProps {
  title: string
  children: JSX.Element
  defaultOpen?: boolean
}

export const CollapseItem = (props: CollapseItemProps) => {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen || false)

  const toggle = () => {
    setIsOpen(!isOpen())
  }

  return (
    <div class="overflow-hidden">
      {/* Header */}
      <button
        onClick={toggle}
        class="w-full headless flex items-center justify-between p-2 text-primary"
      >
        <div class="flex items-center gap-3">
          <span class="font-bold text-lg">
            {props.title}
          </span>
        </div>
        <Chevron
          direction={isOpen() ? "down" : "right"}
          size={16}
          class="transition-transform duration-200"
        />
      </button>

      {/* Content */}
      <Show when={isOpen()}>
        {props.children}
      </Show>
    </div>
  )
}
