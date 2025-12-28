import { Show } from "solid-js"
import { ModalCtrl } from "~/ui/Modal/Modal.ctrl"
import { useStaffPresence } from "./staff-presence.ctrl"
import { StaffPresenceFilters } from "./staff-presence-filters"
import { StaffPresenceTable } from "./staff-presence-table"
import { StaffPresenceFormModal } from "./staff-presence-form.modal"
import type { CreatePresenceData, UpdatePresenceData, StaffPresence } from "./staff-presence.types"
import { useCan } from "../auth/can.ctrl"

export const StaffPresenceView = () => {
  const ctrl = useStaffPresence()
  const modal = ModalCtrl()
  const canAdmin = useCan({ bureau: true })
  const canMember = useCan({ member: true })

  const handleCreate = async (data: CreatePresenceData) => {
    await ctrl.createPresence(data)

    modal.close()
  }

  const handleUpdate = async (id: string, data: UpdatePresenceData) => {
    await ctrl.updatePresence(id, data)
    modal.close()
  }

  const handleDelete = async (id: string) => {
    await ctrl.deletePresence(id)
    modal.close()
  }

  const handleCreatePresence = () => {
    modal.open({
      title: 'Indiquer ma présence',
      content: (
        <StaffPresenceFormModal
          onCreate={handleCreate}
          onCancel={() => {
            modal.close()
          }}
        />
      ),
      size: 'md',
      closable: true,
      onClose: () => {
        // Modal fermé
      }
    })
  }

  const handleEditPresence = (presence: StaffPresence) => {
    modal.open({
      title: 'Modifier ma présence',
      content: (
        <StaffPresenceFormModal
          presence={presence}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onCancel={() => {
            modal.close()
          }}
        />
      ),
      size: 'md',
      closable: true,
      onClose: () => {
        // Modal fermé
      }
    })
  }

  return (
    <div class="w-full h-full relative grid grid-rows-[auto_auto_1fr] gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Présence des membres</h2>
        <Show when={canMember()}>
          <button
            onClick={handleCreatePresence}
            class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          >
            Indiquer ma présence
          </button>
        </Show>
      </div>

      <Show when={canAdmin()}>
        <StaffPresenceFilters ctrl={ctrl} />
      </Show>

      <Show when={ctrl.isLoading() && ctrl.isFetching()}>
        <div class="flex items-center justify-center p-8">
          <div class="text-gray-500">Chargement des présences...</div>
        </div>
      </Show>

      <Show when={!ctrl.isFetching()}>
        <div class="relative h-full overflow-y-auto">
          <div class="bg-white rounded-lg border border-gray-200">
            <StaffPresenceTable ctrl={ctrl} onEdit={handleEditPresence} />
          </div>
        </div>
      </Show>
    </div>
  )
}

