import { onMount, type VoidComponent } from "solid-js"
import { stats } from "./stats.store"
import { statsWsHandler } from "./stats.ws-handler";

export const PeopleInMuseum: VoidComponent = () => {

  onMount(() => {
    statsWsHandler('current_visitors');
  });

  console.log(stats.current_visitors);
  return (
    <div class="border border-border rounded-md p-4 flex items-center justify-center gap-2 bg-white">
      <span class="font-bold text-5xl text-amber-500">{stats.current_visitors} </span>
      Personne{stats.current_visitors > 1 ? 's' : ''} dans le musée
    </div>
  )
}