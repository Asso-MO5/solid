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

export type VisitorSlotStat = {
  date: string;
  day_name: string;
  start_time: string;
  end_time: string;
  capacity: number;
  expected_people: number;
  occupancy_percentage: number;
  is_half_price: boolean;
}

export type DailyTotal = {
  date: string;
  day_name: string;
  total_unique_tickets: number;
}

export type VisitorsStats = {
  week_start: string;
  week_end: string;
  daily_totals: DailyTotal[];
  slots_stats: VisitorSlotStat[];
}

export type Stats = {
  current_visitors: number;
  bank_stats: BankStats;
  tickets_stats: TicketsStats;
  visitors_stats: VisitorsStats | null;
}