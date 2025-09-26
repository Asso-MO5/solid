import { useParams } from "@solidjs/router"
import { useEventCtrl } from "~/features/events/event.ctrl"
import { EventView } from "~/features/events/event.view"

export default function ViewEvent() {
  const params = useParams()
  const { event, loading, error } = useEventCtrl(params.id)

  return (
    <EventView
      event={event()}
      loading={loading()}
      error={error()}
    />
  )
}
