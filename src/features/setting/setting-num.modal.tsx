import { createEffect, createSignal } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"

type SettingNumModalProps = {
  title: string
  value: number
  description: string
  isFloat?: boolean
  setDescription: (description: string) => void
  setValue: (value: number) => void
  onClose: (onClose: () => void) => Promise<void>
}

export const SettingNumModal = (props: SettingNumModalProps) => {
  const [isOpen, setIsOpen] = createSignal(false)
  const modal = ModalCtrl()

  createEffect(() => {
    if (isOpen()) {
      modal.open({
        title: props.title,
        content: (
          <div class="flex flex-col gap-4">
            <input type="number" value={props.value} step={props.isFloat ? '0.10' : '1'} onChange={(e) => props.setValue(Number(e.target.value))} />
            <textarea value={props.description || ''} onChange={(e) => props.setDescription(e.target.value)} />
            <div class="flex items-center gap-2 justify-end">
              <button onClick={() => setIsOpen(false)} class="secondary">Annuler</button>
              <button onClick={() => props.onClose(() => setIsOpen(false))}>Enregistrer</button>
            </div>
          </div>
        ),
        size: 'lg',
        closable: true,
      })
    } else {
      modal.close()
    }
  })

  return <button onClick={() => setIsOpen(true)}>{props.title}</button>
}