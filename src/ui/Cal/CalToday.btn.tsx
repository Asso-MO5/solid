import { CalCtrl } from "./Cal.ctrl"

export const CalTodayBtn = () => {
  const calendar = CalCtrl()

  return (
    <button class="btn" onClick={() => calendar.goToToday()}>Aujourd'hui</button>
  )
}
