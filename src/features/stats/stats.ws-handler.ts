import type { stats } from "./stats.store";

import { clientEnv } from "~/env/client"
import { setStats } from "./stats.store";

const url = {
  current_visitors: `/museum/capacity/current`,
  bank_stats: '/pay/stats',
  tickets_stats: '/museum/tickets/stats'
}


export const statsWsHandler = async (room: keyof typeof stats) => {

  const response = await fetch(`${clientEnv.VITE_OCELOT_URL}${url[room]}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  const data = await response.json();
  setStats(room, room === 'bank_stats' ? data : data[room]);
}
