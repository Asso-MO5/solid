import { Match, Switch } from "solid-js"
import { AuthSignin } from "./auth.signin"
import { AuthSignout } from "./auth.signout"
import { auth } from "./auth.store";

export const AuthProfile = () => (
  <Switch >
    <Match when={!auth?.id}>
      <AuthSignin />
    </Match>
    <Match when={auth?.id}>
      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2">
          <img src={auth?.avatar || ""} alt="Avatar" class="w-6 h-6 rounded-full" />
          <p class="m-0">{auth?.username}</p>
        </div>
        <AuthSignout />
      </div>
    </Match>
  </Switch >
)