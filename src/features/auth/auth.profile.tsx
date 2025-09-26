import { Match, Switch } from "solid-js"
import { AuthSignin } from "./auth.signin"
import { useAuth } from "@solid-mediakit/auth/client"
import { AuthSignout } from "./auth.signout"

export const AuthProfile = () => {
  const auth = useAuth()

  return (
    <Switch>
      <Match when={auth.status() === "unauthenticated"}>
        <AuthSignin />
      </Match>
      <Match when={auth.status() === "authenticated"}>
        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center gap-2">
            <img src={auth.session()?.user?.image || ""} alt="Avatar" class="w-6 h-6 rounded-full" />
            <p class="m-0">{auth.session()?.user?.name}</p>
          </div>
          <AuthSignout />
        </div>
      </Match>
    </Switch>
  )
}