import { clientEnv } from "~/env/client"
import { setStats } from "./stats.store";
import { createStore } from "solid-js/store";

const url = {
  current_visitors: `/museum/capacity/current`,
  tickets_stats: '/museum/tickets/stats',
  visitors_stats: "/museum/tickets/weekly-slots-stats"
}


const [loading, setLoading] = createStore<Record<keyof typeof url, boolean>>({
  current_visitors: false,
  tickets_stats: false,
  visitors_stats: false
});

export const statsWsHandler = async (room: keyof typeof url) => {
  if (loading[room]) return;
  setLoading(room, true);

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
    const roomData = room === 'visitors_stats' ? data : data[room]
    setStats(room, roomData);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(room, false);
  }
}
