import type { Stats } from "./stats.type";
import { createStore } from "solid-js/store";

export const [stats, setStats] = createStore<Stats>({
  current_visitors: 0,
  tickets_stats: {
    total_tickets_sold: 0,
    week_tickets_sold: 0,
    week_tickets_by_day: [],
    total_amount: 0,
    week_amount: 0,
    month_amount: 0
  }
});


