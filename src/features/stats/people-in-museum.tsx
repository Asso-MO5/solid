import { onMount, type VoidComponent } from "solid-js"
import { stats } from "./stats.store"
import { statsWsHandler } from "./stats.ws-handler";
import { StatCard } from "~/ui/stat-card";

export const PeopleInMuseum: VoidComponent = () => {

  onMount(() => {
    statsWsHandler('current_visitors');
  });

  return (<StatCard title="Personne dans le musée" value={stats.current_visitors} unit="personne" unitPlural="personnes" />)
}