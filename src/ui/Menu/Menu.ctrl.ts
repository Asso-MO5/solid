import { createSignal, onMount, type Accessor } from "solid-js"
import { IsMobile } from "~/utils/is-mobile"


type MenuCtrlReturn = {
  open: Accessor<boolean>
  toggle: () => void
  close: () => void
  handleClickInElement: () => void
}
export function MenuCtrl(): MenuCtrlReturn {

  const [open, setOpen] = createSignal(false)
  const isMobile = IsMobile()

  const toggle = () => {
    setOpen(!open())
  }

  const close = () => {
    setOpen(false)
  }

  const handleClickInElement = () => {
    if (isMobile() && open()) {
      close()
    }
  }

  onMount(() => {
    setOpen(window.innerWidth > 768)
  })

  return {
    open,
    toggle,
    close,
    handleClickInElement
  }
}