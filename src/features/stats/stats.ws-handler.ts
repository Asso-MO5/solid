import { clientEnv } from "~/env/client"
import { setStats } from "./stats.store";
import { createSignal } from "solid-js";

const url = {
  current_visitors: `/museum/capacity/current`,
  bank_stats: '/pay/stats',
  tickets_stats: '/museum/tickets/stats',
  visitors_stats: "/museum/tickets/weekly-slots-stats"
}

const [isLoading, setIsLoading] = createSignal(false);

export const statsWsHandler = async (room: keyof typeof url) => {
  if (isLoading()) return;
  setIsLoading(true);

  try {

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
    if (room === 'tickets_stats') {
      statsWsHandler('bank_stats');
      statsWsHandler('visitors_stats');
    }

    if (room === 'bank_stats' || room === 'visitors_stats') {
      setStats(room, data);
    } else {
      setStats(room, data[room]);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}
