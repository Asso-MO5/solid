import { TicketsView } from "~/features/tickets"
import { useCan } from "~/features/auth/can.ctrl";
import { Show } from "solid-js";

const TicketsPage = () => {
  const can = useCan({ admin: true })
  return (
    <Show when={can()}>
      <TicketsView />
    </Show>
  )
}

export default TicketsPage