import { createEffect, createSignal } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { Schedule } from "./schedules.types"

type SchedulesModalProps = {
  title: string
  schedules: Schedule[]
  onSubmit: (schedules: Schedule[]) => void
}
export const SchedulesModal = (props: SchedulesModalProps) => {
  const [isOpen, setIsOpen] = createSignal(false)
  const modal = ModalCtrl()

  createEffect(() => {
    if (isOpen()) {
      modal.open({
        title: props.title,
        content: (
          <div>
            dszdsd
          </div>
        ),
        size: 'xl',
        closable: true,
        onClose: () => setIsOpen(false)
      })
    } else {
      modal.close()
    }
  })

  return (
    <button onClick={() => setIsOpen(true)}>
      Ajouter des horaires
    </button>
  )
}