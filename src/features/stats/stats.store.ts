import type { Stats } from "./stats.type";
import { createStore } from "solid-js/store";

export const [stats, setStats] = createStore<Stats>({
  current_visitors: 0,
  tickets_stats: {
    total_donations: 0,
    average_ticket_price: 0,
    hourly_stats: [],
    grouped_reservations: {
      total_checkouts: 0,
      average_tickets_per_checkout: 0,
      max_tickets_in_checkout: 0,
      checkout_distribution: [],
    },
    total_revenue: 0,
    conversion_rate: 0,
    status_distribution: {
      paid: 0,
      pending: 0,
      cancelled: 0,
      used: 0,
      expired: 0,
    },
    total_tickets_sold: 0,
    week_tickets_sold: 0,
    week_tickets_by_day: [],
    payment_stats: {
      total_year: 0,
      total_month: 0,
      total_week: 0,
      total_day: 0,
    }
  },
  visitors_stats: null,
});


