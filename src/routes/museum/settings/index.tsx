import { For, Show } from "solid-js";
import { useCan } from "~/features/auth/can.ctrl";
import { settingNumCtrl } from "~/features/setting/setting-num.ctrl"
import { SettingNumModal } from '~/features/setting/setting-num.modal';

const CapacityPage = () => {
  const can = useCan({ admin: true })

  const { setting, setSetting, saveSetting, description, setDescription } = settingNumCtrl('capacity')

  const { setting: slotSetting, setSetting: setSlotSetting, saveSetting: saveSlotSetting, description: slotDescription, setDescription: setSlotDescription } = settingNumCtrl('slot_capacity')

  const { setting: guidedVisitPriceSetting, setSetting: setGuidedVisitPriceSetting, saveSetting: saveGuidedVisitPriceSetting, description: guidedVisitPriceDescription, setDescription: setGuidedVisitPriceDescription } = settingNumCtrl('guided_tour_price')
  const { setting: giftCodePriceSetting, setSetting: setGiftCodePriceSetting, saveSetting: saveGiftCodePriceSetting, description: giftCodePriceDescription, setDescription: setGiftCodePriceDescription } = settingNumCtrl('gift_code_price')

  const Options = [
    {
      title: 'Modifier la capacité',
      value: setting,
      setValue: (value: number) => setSetting(value),
      onClose: (onClose: () => void) => saveSetting(onClose),
      description: description,
      setDescription: (description: string) => setDescription(description),
    },
    {
      title: 'Modifier le créneau',
      value: slotSetting,
      setValue: (value: number) => setSlotSetting(value),
      onClose: (onClose: () => void) => saveSlotSetting(onClose),
      description: slotDescription,
      setDescription: (description: string) => setSlotDescription(description),
    },
    {
      title: 'Modifier le prix de la visite guidée',
      value: guidedVisitPriceSetting,
      setValue: (value: number) => setGuidedVisitPriceSetting(value),
      onClose: (onClose: () => void) => saveGuidedVisitPriceSetting(onClose),
      description: guidedVisitPriceDescription,
      setDescription: (description: string) => setGuidedVisitPriceDescription(description),
    },
    {
      title: 'Modifier le prix du code cadeau',
      value: giftCodePriceSetting,
      setValue: (value: number) => setGiftCodePriceSetting(value),
      onClose: (onClose: () => void) => saveGiftCodePriceSetting(onClose),
      description: giftCodePriceDescription,
      setDescription: (description: string) => setGiftCodePriceDescription(description),
    },
  ] as const

  return (
    <Show when={can()}>
      <div class="h-full w-full gap-4 flex flex-col relative overflow-y-auto ">
        <header class="flex justify-between items-center gap2">
          <h1 class="text-2xl font-bold">Réglages</h1>
        </header>
        <For each={Options}>
          {(option) => (
            <div class="flex flex-col items-start p-2 border border-gray-200 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="font-bold text-5xl text-amber-500">{option.value() || 0} </span> {option.title}
              </div>
              <div class="italic text-gray-500 text-sm my-3">
                {option.description()}
              </div>
              <SettingNumModal
                title={option.title}
                value={option.value()}
                setValue={(value: number) => option.setValue(value)}
                onClose={(onClose: () => void) => option.onClose(() => onClose())}
                description={option.description()}
                setDescription={(description: string) => option.setDescription(description)}
              />
            </div>
          )}
        </For>
      </div>
    </Show>
  )
}

export default CapacityPage