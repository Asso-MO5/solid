import { createSignal } from "solid-js"

export const useTabs = (defaultTabId: string | undefined | (() => string | undefined)) => {

  const getDefaultTabId = () => {

    const params = window.location.search
    const paramsObj = new URLSearchParams(params)

    const tabId = paramsObj.get('tab')
    if (tabId) return tabId

    if (typeof defaultTabId === 'function') {
      return defaultTabId() || ''
    }
    return ''
  }

  const [activeTabId, setActiveTabId] = createSignal<string>(getDefaultTabId())

  const changeTab = (tabId: string) => {
    const params = window.location.search
    const paramsObj = new URLSearchParams(params)
    paramsObj.set('tab', tabId)
    const newUrl = `${window.location.pathname}?${paramsObj.toString()}`
    window.history.pushState({}, '', newUrl)
    setActiveTabId(tabId)
  }

  return {
    activeTabId,
    changeTab
  }
}