import { createStore } from "solid-js/store";

export const [stats, setStats] = createStore({
  current_visitors: 0,
});