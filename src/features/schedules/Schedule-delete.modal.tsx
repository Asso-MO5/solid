import { createEffect, createSignal } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"


type ScheduleDeleteModalProps = {
  onDelete: () => Promise<void>
  isLoading: () => boolean
}
export const ScheduleDeleteModal = (props: ScheduleDeleteModalProps) => {
  const [isOpen, setIsOpen] = createSignal(false)
  const modal = ModalCtrl()

  createEffect(() => {
    if (isOpen()) {
      modal.open({
        title: 'Supprimer l\' horaire',
        content: (
          <div class="flex flex-col gap-4">
            <p>Voulez-vous vraiment supprimer cet <span class="whitespace-nowrap">horaire ?</span></p>
            <div class="flex items-center gap-2 justify-end">
              <button onClick={() => setIsOpen(false)} class="secondary" disabled={props.isLoading()}>Annuler</button>
              <button
                disabled={props.isLoading()}
                onClick={async () => {
                  await props.onDelete()
                  setIsOpen(false)
                }}>Supprimer</button>
            </div>
          </div>
        ),
        size: 'sm',
        closable: true,
      })
    } else {
      modal.close()
    }
  })

  return <button onClick={() => setIsOpen(true)} class="secondary">Supprimer</button>
}