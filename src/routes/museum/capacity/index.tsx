import { Show } from "solid-js";
import { useCan } from "~/features/auth/can.ctrl";
import { settingNumCtrl } from "~/features/setting/setting-num.ctrl"
import { SettingNumModal } from '~/features/setting/setting-num.modal';

const CapacityPage = () => {
  const can = useCan({ admin: true })

  const { setting, setSetting, saveSetting, description, setDescription } = settingNumCtrl('capacity')

  const { setting: slotSetting, setSetting: setSlotSetting, saveSetting: saveSlotSetting, description: slotDescription, setDescription: setSlotDescription } = settingNumCtrl('slot_capacity')

  return (
    <Show when={can()}>
      <div class="h-full w-full  relative overflow-y-auto ">
        <header class="flex justify-between items-center gap2">
          <h1 class="text-2xl font-bold">Capacité</h1>
          <div class="flex items-center justify-end gap-2">
            <SettingNumModal
              title="Modifier la capacité"
              value={setting()}
              setValue={(value: number) => setSetting(value)}
              onClose={(onClose: () => void) => saveSetting(onClose)}
              description={description()}
              setDescription={(description: string) => setDescription(description)}
            />
            <SettingNumModal
              title="Modifier le créneau"
              value={slotSetting()}
              setValue={(value: number) => setSlotSetting(value)}
              onClose={(onClose: () => void) => saveSlotSetting(onClose)}
              description={slotDescription()}
              setDescription={(description: string) => setSlotDescription(description)}
            />
          </div>
        </header>
        <div class="italic text-gray-500 text-sm my-3">
          {description()}
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-5xl text-amber-500">{setting() || 0} </span> visiteur{setting() > 1 ? 's' : ''}
        </div>
        <div class="italic text-gray-500 text-sm my-3">
          {slotDescription()}
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-5xl text-amber-500">{slotSetting() || 0} </span> heure{slotSetting() > 1 ? 's' : ''}
        </div>
      </div >
    </Show>
  )
}

export default CapacityPage