import { Tabs } from "~/ui/tabs/Tabs"
import { Schedule } from "./Schedule"
import { SpecialPeriodsView } from "../special-periods"

export const Schedules = () => {

  return (
    <div>
      <Tabs
        tabs={[
          {
            id: 'schedules',
            label: 'Horaires publics',
            content: () => <Schedule type="public" />
          },
          {
            id: 'holiday',
            label: 'Horaires Vacances',
            content: () => <Schedule type="holiday" />
          },
          {
            id: 'manage-holiday',
            label: 'Gérer les vacances',
            content: () => <SpecialPeriodsView />
          }
        ]} />
    </div>
  )
}