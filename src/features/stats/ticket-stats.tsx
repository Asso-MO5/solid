import { For, createMemo, onMount, Show, type VoidComponent } from 'solid-js'
import { stats } from './stats.store'
import { statsWsHandler } from './stats.ws-handler'
import { StatCard } from '~/ui/stat-card'
import { useCan } from '../auth/can.ctrl'
import type { VisitorSlotStat } from './stats.type'

export const TicketStats: VoidComponent = () => {
  const canSeeBank = useCan({ bureau: true })
  const canSeeVisitors = useCan({ bureau: true })
  onMount(() => {
    statsWsHandler('tickets_stats')
    statsWsHandler('bank_stats')
    statsWsHandler('visitors_stats')
  })

  const ticketsStats = () => stats.tickets_stats
  const bankStats = () => stats.bank_stats
  const visitorsStats = () => stats.visitors_stats

  const visitorsByDay = createMemo(() => {
    const visitors = visitorsStats()
    if (!visitors || !visitors.slots_stats?.length) return []

    const byDate = new Map<
      string,
      {
        date: string
        day_name: string
        slots: VisitorSlotStat[]
        totalExpected: number
        totalCapacity: number
      }
    >()

    // Créer un Map pour les daily_totals pour accès rapide
    const dailyTotalsMap = new Map<string, number>()
    if (visitors.daily_totals) {
      for (const daily of visitors.daily_totals) {
        dailyTotalsMap.set(daily.date, daily.total_unique_tickets)
      }
    }

    for (const slot of visitors.slots_stats) {
      const existing = byDate.get(slot.date)
      if (!existing) {
        // Utiliser total_unique_tickets depuis daily_totals si disponible, sinon 0
        const totalUniqueTickets = dailyTotalsMap.get(slot.date) ?? 0
        byDate.set(slot.date, {
          date: slot.date,
          day_name: slot.day_name,
          slots: [slot],
          totalExpected: totalUniqueTickets,
          totalCapacity: slot.capacity,
        })
      } else {
        existing.slots.push(slot)
        existing.totalCapacity += slot.capacity
        // totalExpected reste celui de daily_totals, pas besoin de l'incrémenter
      }
    }

    return Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    )
  })

  const formatDayLabel = (date: string, dayName: string) => {
    try {
      const d = new Date(date)
      const formatted = d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
      })
      return formatted
    } catch {
      return `${dayName} ${date}`
    }
  }

  // Données pour les graphiques
  const weekTicketsChart = createMemo(() => {
    const stats = ticketsStats()
    if (!stats?.week_tickets_by_day) return []
    return stats.week_tickets_by_day.map((day) => ({
      label: day.day_name.charAt(0).toUpperCase() + day.day_name.slice(1),
      value: day.tickets_count,
    }))
  })

  const hourlyChart = createMemo(() => {
    const stats = ticketsStats()
    if (!stats?.hourly_stats) return []
    return stats.hourly_stats.map((hour) => ({
      label: hour.start_time.slice(0, 5),
      value: hour.tickets_count,
      percentage: hour.percentage,
    }))
  })
  const checkoutDistributionChart = createMemo(() => {
    const stats = ticketsStats()
    if (!stats?.grouped_reservations?.checkout_distribution) return []
    return stats.grouped_reservations.checkout_distribution.map((dist) => ({
      label: `${dist.tickets_count} billet${dist.tickets_count > 1 ? 's' : ''}`,
      value: dist.checkouts_count,
    }))
  })

  return (
    <>
      <Show when={!canSeeBank()}>
        <p>{"Vous n'avez pas les permissions pour voir les statistiques."}</p>
      </Show>
      <Show when={canSeeBank()}>
        <StatCard
          title="Total billets vendus"
          value={ticketsStats()?.total_tickets_sold ?? 0}
          unit="billet"
          unitPlural="billets"
        />
        <StatCard
          title="Billets vendus cette semaine"
          value={ticketsStats()?.week_tickets_sold ?? 0}
          unit="billet"
          unitPlural="billets"
        />
        <StatCard
          title="Total dons"
          value={ticketsStats()?.total_donations ?? 0}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Prix moyen"
          value={ticketsStats()?.average_ticket_price ?? 0}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Total"
          value={bankStats()?.total_all_time ?? 0}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Jour"
          value={bankStats()?.total_day ?? 0}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Semaine"
          value={bankStats()?.total_week ?? 0}
          unit="€"
          unitPlural="€"
        />
        <StatCard
          title="Mois"
          value={bankStats()?.total_month ?? 0}
          unit="€"
          unitPlural="€"
        />

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
                        Total attendu :{' '}
                        <span class="font-semibold">{day.totalExpected}</span> /{' '}
                        {day.totalCapacity}
                      </div>
                    </div>
                    <Show when={day.totalExpected > 0}>
                      <div class="flex flex-col gap-2">
                        <For each={day.slots}>
                          {(slot) => {
                            const percentage = Math.min(
                              slot.occupancy_percentage ?? 0,
                              100
                            )
                            const start = slot.start_time?.slice(0, 5) ?? ''
                            const end = slot.end_time?.slice(0, 5) ?? ''
                            return (
                              <div class="flex flex-col gap-1">
                                <div class="flex items-center justify-between text-[11px] text-gray-600">
                                  <span>
                                    {start} - {end}{' '}
                                    {slot.is_half_price ? '(tarif réduit)' : ''}
                                  </span>
                                  <span>
                                    {slot.expected_people} / {slot.capacity} (
                                    {percentage}%)
                                  </span>
                                </div>
                                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    class="h-full bg-primary transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
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

        {/* Graphique des billets par jour de la semaine */}
        <Show when={weekTicketsChart().length > 0}>
          <div class="lg:col-span-2 md:col-span-1 col-span-full border border-border rounded-md p-4 bg-white">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              Billets vendus par jour (cette semaine)
            </h3>
            <div class="flex flex-col gap-2">
              <For each={weekTicketsChart()}>
                {(item) => {
                  const max = Math.max(...weekTicketsChart().map(i => i.value), 1)
                  const percentage = (item.value / max) * 100
                  return (
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700 font-medium">{item.label}</span>
                        <span class="text-gray-800 font-semibold">{item.value}</span>
                      </div>
                      <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                }}
              </For>
            </div>
          </div>
        </Show>

        {/* Graphique des billets par heure */}
        <Show when={hourlyChart().length > 0}>
          <div class="md:col-span-2 col-span-full border border-border rounded-md p-4 bg-white">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              Répartition par heure
            </h3>
            <div class="flex flex-col gap-2">
              <For each={hourlyChart()}>
                {(item) => {
                  const max = Math.max(...hourlyChart().map(i => i.value), 1)
                  const percentage = item.percentage ?? (item.value / max) * 100
                  return (
                    <div class="flex flex-col gap-1">
                      <div class="flex items-center justify-between text-sm">
                        <span class="text-gray-700 font-medium">{item.label}</span>
                        <div class="flex items-center gap-2">
                          <span class="text-gray-800 font-semibold">{item.value}</span>
                          <span class="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                }}
              </For>
            </div>
          </div>
        </Show>

        {/* Statistiques des réservations groupées */}
        <Show when={ticketsStats()?.grouped_reservations}>
          <div class="col-span-full border border-border rounded-md p-4 bg-white">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
              Réservations groupées
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="text-center p-3 bg-gray-50 rounded">
                <div class="text-sm text-gray-600">Total commandes</div>
                <div class="text-2xl font-bold text-gray-800">
                  {ticketsStats()?.grouped_reservations?.total_checkouts ?? 0}
                </div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded">
                <div class="text-sm text-gray-600">
                  Moyenne billets/commande
                </div>
                <div class="text-2xl font-bold text-gray-800">
                  {ticketsStats()?.grouped_reservations?.average_tickets_per_checkout?.toFixed(
                    1
                  ) ?? '0'}
                </div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded">
                <div class="text-sm text-gray-600">Max billets/commande</div>
                <div class="text-2xl font-bold text-gray-800">
                  {ticketsStats()?.grouped_reservations
                    ?.max_tickets_in_checkout ?? 0}
                </div>
              </div>
            </div>
            <Show when={checkoutDistributionChart().length > 0}>
              <h4 class="text-sm font-medium text-gray-700 mb-2">
                Répartition par nombre de billets
              </h4>
              <div class="flex flex-col gap-2">
                <For each={checkoutDistributionChart()}>
                  {(item) => {
                    const max = Math.max(...checkoutDistributionChart().map(i => i.value), 1)
                    const percentage = (item.value / max) * 100
                    return (
                      <div class="flex flex-col gap-1">
                        <div class="flex items-center justify-between text-sm">
                          <span class="text-gray-700 font-medium">{item.label}</span>
                          <span class="text-gray-800 font-semibold">{item.value}</span>
                        </div>
                        <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  }}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </Show>
    </>
  )
}
