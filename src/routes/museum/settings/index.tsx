import { Show } from "solid-js";
import { useCan } from "~/features/auth/can.ctrl";
import { settingNumCtrl } from "~/features/setting/setting-num.ctrl"
import { SettingNumModal } from '~/features/setting/setting-num.modal';

const CapacityPage = () => {
  const can = useCan({ admin: true })

  const { setting, setSetting, saveSetting, description, setDescription } = settingNumCtrl('capacity')

  const { setting: slotSetting, setSetting: setSlotSetting, saveSetting: saveSlotSetting, description: slotDescription, setDescription: setSlotDescription } = settingNumCtrl('slot_capacity')

  const { setting: guidedVisitPriceSetting, setSetting: setGuidedVisitPriceSetting, saveSetting: saveGuidedVisitPriceSetting, description: guidedVisitPriceDescription, setDescription: setGuidedVisitPriceDescription } = settingNumCtrl('guided_tour_price')
  const { setting: giftCodePriceSetting, setSetting: setGiftCodePriceSetting, saveSetting: saveGiftCodePriceSetting, description: giftCodePriceDescription, setDescription: setGiftCodePriceDescription } = settingNumCtrl('gift_code_price')

  return (
    <Show when={can()}>
      <div class="h-full w-full gap-4 flex flex-col relative overflow-y-auto ">
        <header class="flex justify-between items-center gap2">
          <h1 class="text-2xl font-bold">Réglages</h1>
        </header>

        <div class="flex flex-col items-start p-2 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="font-bold text-5xl text-amber-500">{setting() || 0} </span> visiteur{setting() > 1 ? 's' : ''}
          </div>
          <div class="italic text-gray-500 text-sm my-3">
            {description()}
          </div>
          <SettingNumModal
            title="Modifier la capacité"
            value={setting()}
            setValue={(value: number) => setSetting(value)}
            onClose={(onClose: () => void) => saveSetting(onClose)}
            description={description()}
            setDescription={(description: string) => setDescription(description)}
          />
        </div>
        <div class="flex flex-col items-start p-2 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="font-bold text-5xl text-amber-500">{slotSetting() || 0} </span> heure{slotSetting() > 1 ? 's' : ''}
          </div>
          <div class="italic text-gray-500 text-sm my-3">
            {slotDescription()}
          </div>
          <SettingNumModal
            title="Modifier le créneau"
            value={slotSetting()}
            setValue={(value: number) => setSlotSetting(value)}
            onClose={(onClose: () => void) => saveSlotSetting(onClose)}
            description={slotDescription()}
            setDescription={(description: string) => setSlotDescription(description)}
          />
        </div>
        <div class="flex flex-col items-start p-2 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="font-bold text-5xl text-amber-500">{guidedVisitPriceSetting() || 0} </span> €</div>
          <div class="italic text-gray-500 text-sm my-3">
            {guidedVisitPriceDescription()}
          </div>
          <SettingNumModal
            title="Modifier le prix de la visite guidée"
            isFloat={true}
            value={guidedVisitPriceSetting()}
            setValue={(value: number) => setGuidedVisitPriceSetting(value)}
            onClose={(onClose: () => void) => saveGuidedVisitPriceSetting(onClose)}
            description={guidedVisitPriceDescription()}
            setDescription={(description: string) => setGuidedVisitPriceDescription(description)}
          />
        </div>
        <div class="flex flex-col items-start p-2 border border-gray-200 rounded-lg">
          <div class="flex items-center gap-2">
            <span class="font-bold text-5xl text-amber-500">{giftCodePriceSetting() || 0} </span> €
          </div>
          <div class="italic text-gray-500 text-sm my-3">
            {giftCodePriceDescription()}
          </div>
          <SettingNumModal
            title="Modifier le prix du code cadeau"
            value={giftCodePriceSetting()}
            setValue={(value: number) => setGiftCodePriceSetting(value)}
            onClose={(onClose: () => void) => saveGiftCodePriceSetting(onClose)}
            description={giftCodePriceDescription()}
            setDescription={(description: string) => setGiftCodePriceDescription(description)}
          />
        </div>
      </div >
    </Show>
  )
}

export default CapacityPage