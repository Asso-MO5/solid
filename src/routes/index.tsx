import { PeopleInMuseum } from "~/features/stats/people-in-museum"


const HomePage = () => {
  return (
    <div class="h-full w-full  relative overflow-y-auto ">
      <div class="absolute inset-0 flex flex-wrap gap-4  items-start">
        <PeopleInMuseum />
      </div>
    </div>
  )
}

export default HomePage