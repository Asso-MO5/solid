import { MuseumPresenceView } from "~/features/museum-presence/museum-presence.view"
import { useCan } from "~/features/auth/can.ctrl"
import { Show } from "solid-js"
import { Navigate } from "@solidjs/router"

export default () => {
  const canMember = useCan({ member: true })

  return (
    <Show when={canMember()} fallback={<Navigate href="/" />}>
      <MuseumPresenceView />
    </Show>
  )
}

