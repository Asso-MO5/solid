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
  const modal = ModalCtrl()

  return <button onClick={() => modal.open({
    title: props.title,
    content: (
      <div class="flex flex-col gap-4">
        <input type="number" value={props.value} step={props.isFloat ? '0.10' : '1'} onChange={(e) => props.setValue(Number(e.target.value))} />
        <textarea value={props.description || ''} onChange={(e) => props.setDescription(e.target.value)} />
        <div class="flex items-center gap-2 justify-end">
          <button onClick={() => modal.close()} class="secondary">Annuler</button>
          <button onClick={() => props.onClose(() => modal.close())}>Enregistrer</button>
        </div>
      </div>
    ),
    size: 'lg',
    closable: true,
  })}>{props.title}</button>
}