import { clientEnv } from "~/env/client";

export const AuthSignout = () => (
  <a
    href={`${clientEnv.VITE_OCELOT_URL}/auth/signout`}
    class="headless text-sm text-secondary hover:text-accent p-0 cursor-pointer"
  >
    Se déconnecter
  </a>
)