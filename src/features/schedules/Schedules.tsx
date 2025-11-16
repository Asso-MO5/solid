import { Tabs } from "~/ui/tabs/Tabs"
import { Schedule } from "./Schedule"

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
            id: 'members-schedules',
            label: 'Horaires membres',
            content: () => <Schedule type="member" />
          }
        ]} />
    </div>
  )
}