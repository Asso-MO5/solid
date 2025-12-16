import { For, createMemo, onMount, Show, type VoidComponent } from "solid-js"
import { stats } from "./stats.store"
import { statsWsHandler } from "./stats.ws-handler";
import { StatCard } from "~/ui/stat-card";
import { useCan } from "../auth/can.ctrl";
import type { VisitorSlotStat } from "./stats.type";

export const TicketStats: VoidComponent = () => {
  const canSeeBank = useCan({ bureau: true })
  const canSeeVisitors = useCan({ bureau: true })
  onMount(() => {
    statsWsHandler('tickets_stats');
    statsWsHandler('bank_stats');
    statsWsHandler('visitors_stats');
  });

  const ticketsStats = () => stats.tickets_stats
  const bankStats = () => stats.bank_stats
  const visitorsStats = () => stats.visitors_stats

  const visitorsByDay = createMemo(() => {
    const visitors = visitorsStats();
    if (!visitors || !visitors.slots_stats?.length) return [];

    const byDate = new Map<string, {
      date: string;
      day_name: string;
      slots: VisitorSlotStat[];
      totalExpected: number;
      totalCapacity: number;
    }>();

    // Créer un Map pour les daily_totals pour accès rapide
    const dailyTotalsMap = new Map<string, number>();
    if (visitors.daily_totals) {
      for (const daily of visitors.daily_totals) {
        dailyTotalsMap.set(daily.date, daily.total_unique_tickets);
      }
    }

    for (const slot of visitors.slots_stats) {
      const existing = byDate.get(slot.date);
      if (!existing) {
        // Utiliser total_unique_tickets depuis daily_totals si disponible, sinon 0
        const totalUniqueTickets = dailyTotalsMap.get(slot.date) ?? 0;
        byDate.set(slot.date, {
          date: slot.date,
          day_name: slot.day_name,
          slots: [slot],
          totalExpected: totalUniqueTickets,
          totalCapacity: slot.capacity,
        });
      } else {
        existing.slots.push(slot);
        existing.totalCapacity += slot.capacity;
        // totalExpected reste celui de daily_totals, pas besoin de l'incrémenter
      }
    }

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  });

  const formatDayLabel = (date: string, dayName: string) => {
    try {
      const d = new Date(date);
      const formatted = d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      });
      return formatted;
    } catch {
      return `${dayName} ${date}`;
    }
  };

  return (
    <>
      <Show when={canSeeBank()}>
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
      <div class="col-span-full">
        <Show when={visitorsByDay().length && canSeeVisitors()}>
          <div class="lg:grid-cols-4 md:grid-cols-2 mt-4 grid grid-cols-1 gap-4 w-full">
            <For each={visitorsByDay()}>
              {(day) => (
                <div class="border border-border rounded-md p-4 bg-white flex flex-col gap-3">
                  <div class="flex items-baseline justify-between gap-4">
                    <div class="font-semibold text-sm text-gray-800">
                      {formatDayLabel(day.date, day.day_name)}
                    </div>
                    <div class="text-xs text-gray-600">
                      Total attendu :{" "}
                      <span class="font-semibold">
                        {day.totalExpected}
                      </span>
                      {" "}/ {day.totalCapacity}
                    </div>
                  </div>
                  <Show when={day.totalExpected > 0}>
                    <div class="flex flex-col gap-2">
                      <For each={day.slots}>
                        {(slot) => {
                          const percentage = Math.min(slot.occupancy_percentage ?? 0, 100);
                          const start = slot.start_time?.slice(0, 5) ?? '';
                          const end = slot.end_time?.slice(0, 5) ?? '';
                          return (
                            <div class="flex flex-col gap-1">
                              <div class="flex items-center justify-between text-[11px] text-gray-600">
                                <span>
                                  {start} - {end} {slot.is_half_price ? "(tarif réduit)" : ""}
                                </span>
                                <span>
                                  {slot.expected_people} / {slot.capacity} ({percentage}%)
                                </span>
                              </div>
                              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  class="h-full bg-primary transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </>
  )
}