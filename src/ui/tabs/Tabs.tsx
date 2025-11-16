import { createMemo, For, Show, type JSX } from "solid-js"
import { useTabs } from "./Tabs.ctrl"

interface TabsProps {
  tabs: {
    id: string
    label: string
    content: JSX.Element | (() => JSX.Element)
  }[]
}

export const Tabs = (props: TabsProps) => {
  const ctrl = useTabs(() => props.tabs[0]?.id)

  const activeTab = createMemo(() => props.tabs.find(tab => tab.id === ctrl.activeTabId()))

  const Content = createMemo(() => {
    const tab = activeTab()
    if (!tab) return null

    // Si le contenu est une fonction, l'appeler (lazy loading)
    if (typeof tab.content === 'function') {
      return tab.content()
    }
    // Sinon, retourner le contenu directement
    return tab.content
  })

  return (
    <>
      <nav class="flex gap-2">
        <For each={props.tabs}>
          {tab => (
            <button
              data-active={ctrl.activeTabId() === tab.id}
              class="bg-transparent text-primary  hover:text-primary
              border-transparent p-0 pb-1 m-0 font-bold
              rounded-none
              border-b-2 
              data-[active=true]:border-b-secondary
              "
              onClick={() => ctrl.changeTab(tab.id)}>{tab.label}</button>
          )}
        </For>
      </nav>
      <Show when={Content()}>
        {Content()}
      </Show>
    </>
  )
}

