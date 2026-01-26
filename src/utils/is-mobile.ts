import { createSignal, onCleanup, onMount } from "solid-js"

const [isMobile, setIsMobile] = createSignal(false)

export const IsMobile = () => {

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
      checkMobile()
    }
  })

  onCleanup(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', checkMobile)
    }
  })
  return isMobile
}