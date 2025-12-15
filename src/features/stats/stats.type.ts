export type TicketsStats = {
  total_tickets_sold: number;
  week_tickets_sold: number;
  week_tickets_by_day: {
    date: string;
    day_name: string;
    tickets_count: number;
    amount: number;
  }[];
}

export type BankStats = {
  total_all_time: number;
  total_day: number;
  total_month: number;
  total_week: number;
}

export type Stats = {
  current_visitors: number;
  bank_stats: BankStats;
  tickets_stats: TicketsStats;
}