import { createEffect, createSignal, onCleanup } from "solid-js";
import { clientEnv } from "~/env/client";
import { setAuth } from "./auth.store";

export const useAuth = () => {
  const [isFetched, setIsFetched] = createSignal(false);

  const me = async () => {
    try {
      const response = await fetch(`${clientEnv.VITE_OCELOT_URL}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      setAuth(data);
      return data;
    } catch (error) {
      console.error(error);
    }
    finally {
      setIsFetched(true);
    }
  }

  createEffect(() => {
    me();
    const onFocus = () => {
      me();
    };
    window.addEventListener('focus', onFocus);
    onCleanup(() => {
      window.removeEventListener('focus', onFocus);
    });
  });

  return {
    me,
    isFetched
  }
}