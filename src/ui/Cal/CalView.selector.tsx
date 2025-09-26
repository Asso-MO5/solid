import { For } from "solid-js"
import { VIEWS_TEXT } from "./Cal.const"
import { CalCtrl } from "./Cal.ctrl"
import type { CalendarView } from "./Cal.types"

export const CalViewSelector = () => {
  const calendar = CalCtrl()
  return (
    <select class="min-w-[80px]" value={calendar.view()} onInput={(e) => calendar.setView(e.currentTarget?.value as CalendarView)}>
      <For each={Object.keys(VIEWS_TEXT) as CalendarView[]}>
        {(view) => <option value={view}>{VIEWS_TEXT[view as CalendarView]}</option>}
      </For>
    </select>
  )
}