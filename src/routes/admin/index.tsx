import { useAuth } from "@solid-mediakit/auth/client";
import { Show } from "solid-js";
import { AuthSignin } from "~/features/auth/auth.signin";

const Admin = () => {
  const { session } = useAuth();

  return (
    <>
      <Show when={session()?.user?.name}>
        <div class="grid grid-rows-[auto_1fr]">
          <h1 class="text-center">Administration</h1>
        </div>
      </Show>

      <Show when={!session()?.user?.name}>
        <div class="text-center flex h-full items-center justify-center">
          <AuthSignin />
        </div>
      </Show >
    </>
  )
}

export default Admin