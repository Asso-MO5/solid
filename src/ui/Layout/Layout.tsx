import { A } from "@solidjs/router"
import { Show, type JSX } from "solid-js"
import { useAuth } from "@solid-mediakit/auth/client"
import { Menu } from "../Menu/Menu"
import { ToastContainer } from "../Toast"

type LayoutProps = {
  children: JSX.Element
}

export const Layout = (props: LayoutProps) => {
  const { session } = useAuth();

  return (
    <>
      <ToastContainer />
      <div class="grid grid-cols-[auto_1fr] gap-2 bg-bg">
        <Menu />
        <div class="grid grid-rows-[1fr_auto] gap-2 h-[100dvh] ">
          <div class="h-full relative">
            <div class="absolute inset-0 p-4">
              {props.children}
            </div>
          </div>
          <footer class="flex justify-center gap-4 pb-4" >
            <A href="/">Accueil</A>
            <Show when={session()?.user?.roles?.member}>
              <A href="/admin">Administration</A>
            </Show>
          </footer >
        </div >
      </div >
    </>
  )
}