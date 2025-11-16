import { PeopleInMuseum } from "~/features/stats/people-in-museum"
import { TicketStats } from "~/features/stats/ticket-stats"


const HomePage = () => {
  return (
    <div class="h-full w-full  relative overflow-y-auto ">
      <div class="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
        <PeopleInMuseum />
        <TicketStats />
        {/** TODO: Add more stats */}
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  )
}

export default HomePage