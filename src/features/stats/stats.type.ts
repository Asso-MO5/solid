export type TicketsStats = {
  total_tickets_sold: number;
  week_tickets_sold: number;
  week_tickets_by_day: {
    date: string;
    day_name: string;
    tickets_count: number;
    amount: number;
  }[];
  total_amount: number;
  week_amount: number;
  month_amount: number;
}

export type Stats = {
  current_visitors: number;
  tickets_stats: TicketsStats;
}