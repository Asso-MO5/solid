import { createWS } from "@solid-primitives/websocket";
import { clientEnv } from "~/env/client";
import { onMount } from "solid-js";

let ws: ReturnType<typeof createWS> | null = null;

export const WebSocketProvider = ({
  handlers = {}
}: {
  handlers?: {
    [key: string]: (room: string, action: string,) => Promise<void>;
  }
}) => {
  onMount(() => {
    if (typeof window === 'undefined') {
      return;
    }
    ws = createWS(clientEnv.VITE_OCELOT_WS);
    ws.addEventListener("message", (ev) => {

      const data = ev.data.startsWith('{') ? JSON.parse(ev.data) : ev.data;
      if (data.action) {
        handlers?.[data.room]?.(data.room, data.action);
      }
    });
  });

  return null;
};