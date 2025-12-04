import { onMount, Show, type VoidComponent } from "solid-js"
import { stats } from "./stats.store"
import { statsWsHandler } from "./stats.ws-handler";
import { StatCard } from "~/ui/stat-card";
import { useCan } from "../auth/can.ctrl";

export const TicketStats: VoidComponent = () => {
  const can = useCan({ admin: true })
  onMount(() => {
    statsWsHandler('tickets_stats');
  });

  const ticketsStats = () => stats.tickets_stats

  return (
    <Show when={can()}>
      <>
        <StatCard
          title="Total billets vendus"
          value={ticketsStats().total_tickets_sold}
          unit="billet"
          unitPlural="billets"
        />

        <StatCard
          title="Montant total"
          value={ticketsStats().total_amount}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Billets vendus cette semaine"
          value={ticketsStats().week_tickets_sold}
          unit="billet"
          unitPlural="billets"
        />
        <StatCard
          title="Montant de la semaine"
          value={ticketsStats().week_amount}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Montant du mois"
          value={ticketsStats().month_amount}
          unit="€"
          unitPlural="€"
        />
      </>
    </Show>
  )
}