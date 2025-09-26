import { A } from "@solidjs/router";
import { AuthProfile } from "~/features/auth/auth.profile";
import { MenuCtrl } from "./Menu.ctrl";
import { For, Show } from "solid-js";
import { menuEntries } from "./Menu.entries";

export function Menu() {
  const { open, toggle } = MenuCtrl()
  return (
    <>
      <button onClick={toggle} class="headless fixed top-2 left-2 cursor-pointer z-50">
        <div class="w-7 flex flex-col gap-1">
          <div class="w-full h-1 bg-primary" />
          <div class="w-full h-1 bg-primary" />
          <div class="w-full h-1 bg-primary" />
        </div>
      </button>

      <Show when={!open()}>
        <div class="md:w-6" />
      </Show>
      <Show when={open()}>
        <div class="md:hidden" /> {/* Pour éviter que le menu s'étende sur la page */}
        <div class="grid grid-rows-[auto_1fr_auto] gap-4 p-4 h-full border-r border-primary top-0 left-0  bottom-0 fixed md:relative bg-bg z-40 ">
          <A href="/" class="flex items-center justify-center gap-2">
            <img src="/mo5.webp" class="w-10 h-10" alt="Logo" title={`Association MO5`} />
          </A>
          <div class="relative h-full">
            <div class="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent scrollbar-track-rounded-full overflow-x-hidden flex flex-col gap-4">
              <For each={menuEntries}>
                {(entry) => <div>
                  <A href={entry.href} class="text-primary font-bold">{entry.label}</A>
                  <Show when={entry.entries.length > 0}>
                    <div class="flex flex-col gap-3 pl-1">
                      <For each={entry.entries}>
                        {(entry) => <div>
                          <A href={entry.href}>{entry.label}</A>
                        </div>}
                      </For>
                    </div>
                  </Show>
                </div>}
              </For>
            </div>
          </div>
          <AuthProfile />
        </div >
      </Show >
    </>
  )
}
