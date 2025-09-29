import { type JSX } from "solid-js"

interface CollapseGroupProps {
  children: JSX.Element
  spacing?: "sm" | "md" | "lg"
}

export const CollapseGroup = (props: CollapseGroupProps) => {
  return (
    <div
      class={`data-[spacing=sm]:space-y-2 data-[spacing=md]:space-y-3 data-[spacing=lg]:space-y-4`}
      data-spacing={props.spacing || "md"}
    >
      {props.children}
    </div>
  )
}
