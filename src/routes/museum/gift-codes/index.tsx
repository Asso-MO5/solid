import { GiftCodesView } from "~/features/gift-codes"
import { useCan } from "~/features/auth/can.ctrl";
import { Show } from "solid-js";

const GiftCodesPage = () => {
  const can = useCan({ admin: true })
  return (
    <Show when={can()}>
      <div class="h-full w-full">
        <GiftCodesView />
      </div>
    </Show>
  )
}

export default GiftCodesPage

