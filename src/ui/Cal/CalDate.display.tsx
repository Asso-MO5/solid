import { CalCtrl } from "./Cal.ctrl"

export const CalDateDisplay = () => {
  const calendar = CalCtrl()

  return (
    <div class="text-xl font-semibold">
      {calendar.currentMonthName()} {calendar.currentYear()}
    </div>
  )
}