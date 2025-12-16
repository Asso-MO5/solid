import type { Stats } from "./stats.type";
import { createStore } from "solid-js/store";

export const [stats, setStats] = createStore<Stats>({
  current_visitors: 0,
  bank_stats: {
    total_all_time: 0,
    total_day: 0,
    total_month: 0,
    total_week: 0
  },
  tickets_stats: {
    total_tickets_sold: 0,
    week_tickets_sold: 0,
    week_tickets_by_day: [],
  },
  visitors_stats: null,
});


