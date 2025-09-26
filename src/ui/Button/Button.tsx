import { type JSX } from "solid-js"

interface ButtonProps {
  children: JSX.Element
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      type={props.type || "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      class="inline-flex items-center justify-center font-medium rounded-lg transition-colors
        data-[variant=primary]:bg-primary data-[variant=primary]:text-white data-[variant=primary]:hover:bg-primary/90
        data-[variant=secondary]:bg-gray-100 data-[variant=secondary]:text-gray-700 data-[variant=secondary]:hover:bg-gray-200
        data-[variant=danger]:bg-red-100 data-[variant=danger]:text-red-700 data-[variant=danger]:hover:bg-red-200
        data-[variant=ghost]:bg-transparent data-[variant=ghost]:text-gray-700 data-[variant=ghost]:hover:bg-gray-100
        data-[size=sm]:px-3 data-[size=sm]:py-1.5 data-[size=sm]:text-sm
        data-[size=md]:px-4 data-[size=md]:py-2 data-[size=md]:text-sm
        data-[size=lg]:px-6 data-[size=lg]:py-3 data-[size=lg]:text-base
        disabled:opacity-50 disabled:cursor-not-allowed"
      data-variant={props.variant || "primary"}
      data-size={props.size || "md"}
    >
      {props.children}
    </button>
  )
}
