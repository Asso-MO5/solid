import { createStore } from "solid-js/store";
import type { SessionUser } from "./auth.types";

export const [auth, setAuth] = createStore<SessionUser>();