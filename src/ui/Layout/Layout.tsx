import { Show, type JSX } from "solid-js"
import { Menu } from "../Menu/Menu"
import { ToastContainer } from "../Toast"
import { useAuth } from "~/features/auth/auth.ctrl"
import { auth } from "~/features/auth/auth.store"
import { AuthSignin } from "~/features/auth/auth.signin"

type LayoutProps = {
  children: JSX.Element
}

export const Layout = (props: LayoutProps) => {
  const { isFetched } = useAuth()

  return (
    <>
      <Show when={auth?.id}>
        <ToastContainer />
        <div class="grid grid-cols-[auto_1fr] gap-2 bg-bg">
          <Menu />
          <div class="grid grid-rows-[1fr_auto] gap-2 h-[100dvh]">
            <div class="h-full relative">
              <div class="absolute inset-0 p-4">
                {props.children}
              </div>
            </div>
            <footer />
          </div >
        </div >
      </Show>
      <Show when={!auth?.id && isFetched()}>
        <main class="flex flex-col items-center justify-center relative h-[100dvh] gap-3">
          <img src="/solid.webp" alt="Logo" class="max-w-[200px] mx-auto" />
          <AuthSignin />
        </main >
      </Show>
    </>
  )
}