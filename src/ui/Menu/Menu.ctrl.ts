import { createSignal, onMount, type Accessor } from "solid-js"


type MenuCtrlReturn = {
  open: Accessor<boolean>
  toggle: () => void
}
export function MenuCtrl(): MenuCtrlReturn {

  const [open, setOpen] = createSignal(false)

  const toggle = () => {
    setOpen(!open())
  }

  onMount(() => {
    setOpen(window.innerWidth > 768)
  })

  return {
    open,
    toggle,
  }
}