import type { JSX } from "solid-js"

type ChevronDirection = 'up' | 'down' | 'left' | 'right'

interface ChevronProps {
  direction: ChevronDirection
  size?: number
  class?: string
}

export const Chevron = (props: ChevronProps): JSX.Element => {
  return (
    <svg
      width={props.size || 16}
      height={props.size || 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class={`chevron data-[direction=up]:-rotate-90 data-[direction=down]:rotate-90 data-[direction=left]:rotate-180 data-[direction=right]:-rotate-0 ${props.class || ''}`}
      data-direction={props.direction}
    >
      <polyline points="9,18 15,12 9,6" />
    </svg>
  )
}
