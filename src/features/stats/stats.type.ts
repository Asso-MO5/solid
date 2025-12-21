export type TicketsStats = {
  total_tickets_sold: number;
  week_tickets_sold: number;
  week_tickets_by_day: {
    date: string;
    day_name: string;
    tickets_count: number;
  }[];
  total_donations: number;
  average_ticket_price: number;
  hourly_stats: {
    start_time: string;
    tickets_count: number;
    percentage: number;
  }[];
  grouped_reservations: {
    total_checkouts: number;
    average_tickets_per_checkout: number;
    max_tickets_in_checkout: number;
    checkout_distribution: {
      tickets_count: number;
      checkouts_count: number;
    }[];
  };
  total_revenue: number;
  conversion_rate: number;
  status_distribution: {
    paid: number;
    pending: number;
    cancelled: number;
    used: number;
    expired: number;
  };
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