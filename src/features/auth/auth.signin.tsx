import { clientEnv } from "~/env/client"

export const AuthSignin = () => (<a
  href={`${clientEnv.VITE_OCELOT_URL}/auth/signin`}
  class="bg-discord text-white px-4 py-2 rounded-md font-bold"
>
  Se connecter
</a>
)