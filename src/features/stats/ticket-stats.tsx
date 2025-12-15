import { onMount, Show, type VoidComponent } from "solid-js"
import { stats } from "./stats.store"
import { statsWsHandler } from "./stats.ws-handler";
import { StatCard } from "~/ui/stat-card";
import { useCan } from "../auth/can.ctrl";

export const TicketStats: VoidComponent = () => {
  const can = useCan({ admin: true })
  onMount(() => {
    statsWsHandler('tickets_stats');
    statsWsHandler('bank_stats');

  });

  const ticketsStats = () => stats.tickets_stats
  const bankStats = () => stats.bank_stats

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
          title="Billets vendus cette semaine"
          value={ticketsStats().week_tickets_sold}
          unit="billet"
          unitPlural="billets"
        />
        <StatCard
          title="Total"
          value={bankStats().total_all_time}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Jour"
          value={bankStats().total_day}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Semaine"
          value={bankStats().total_week}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Mois"
          value={bankStats().total_month}
          unit="€"
          unitPlural="€"
        />
      </>
    </Show>
  )
}