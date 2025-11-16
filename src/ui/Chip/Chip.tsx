import { type JSX } from "solid-js"

interface ChipProps {
  children: JSX.Element
  type?: "status" | "category" | "default"
  variant?: "draft" | "published" | "cancelled" | "completed" | "video" | "expo" | "ag" | "live" | "meeting" | "training" | "conference" | "other"
}

export const Chip = (props: ChipProps) => {
  return (
    <span
      class="px-3 py-1 rounded-full text-sm font-medium
        data-[type=status]:data-[variant=draft]:bg-gray-100 data-[type=status]:data-[variant=draft]:text-gray-800
        data-[type=status]:data-[variant=published]:bg-green-100 data-[type=status]:data-[variant=published]:text-green-800
        data-[type=status]:data-[variant=cancelled]:bg-red-100 data-[type=status]:data-[variant=cancelled]:text-red-800
        data-[type=status]:data-[variant=completed]:bg-blue-100 data-[type=status]:data-[variant=completed]:text-blue-800
        data-[type=category]:data-[variant=video]:bg-blue-100 data-[type=category]:data-[variant=video]:text-blue-800
        data-[type=category]:data-[variant=expo]:bg-purple-100 data-[type=category]:data-[variant=expo]:text-purple-800
        data-[type=category]:data-[variant=ag]:bg-green-100 data-[type=category]:data-[variant=ag]:text-green-800
        data-[type=category]:data-[variant=live]:bg-red-100 data-[type=category]:data-[variant=live]:text-red-800
        data-[type=category]:data-[variant=meeting]:bg-yellow-100 data-[type=category]:data-[variant=meeting]:text-yellow-800
        data-[type=category]:data-[variant=training]:bg-indigo-100 data-[type=category]:data-[variant=training]:text-indigo-800
        data-[type=category]:data-[variant=conference]:bg-pink-100 data-[type=category]:data-[variant=conference]:text-pink-800
        data-[type=category]:data-[variant=other]:bg-gray-100 data-[type=category]:data-[variant=other]:text-gray-800
        data-[type=default]:bg-gray-100 data-[type=default]:text-gray-800"
      data-type={props.type || "default"}
      data-variant={props.variant}
    >
      {props.children}
    </span>
  )
}
